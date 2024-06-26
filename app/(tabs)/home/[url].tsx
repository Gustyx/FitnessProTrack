import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { auth, db } from "../../../firebase.config";
import { getMetadata, updateMetadata } from "firebase/storage";
import {
  ImageDetails,
  keys,
  screenHeight,
  screenWidth,
  imageDetails,
  formatDate,
  getImageRef,
} from "../../constants";
import { ImageSize } from "expo-camera";
import DateTimePicker from "@react-native-community/datetimepicker";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Inspect = () => {
  const params = useLocalSearchParams();
  const url = Array.isArray(params.url) ? params.url[0] : params.url;
  const [imageScale, setImageScale] = useState<number>(1);
  const [displayDetails, setDisplayDetails] = useState<boolean>(false);
  const [thisImageDetails, setThisImageDetails] =
    useState<ImageDetails>(imageDetails);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [oldPose, setOldPose] = useState("");
  const [oldDate, setOldDate] = useState("");

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const { width, height }: ImageSize = await new Promise(
          (resolve, reject) => {
            Image.getSize(
              url,
              (width, height) => resolve({ width, height }),
              reject
            );
          }
        );
        setImageScale(height / width);
      } catch (error) {
        console.error("Error getting image size:", error);
      }
    };

    const getImageMetadata = () => {
      try {
        const ref = getImageRef(url);
        getMetadata(ref)
          .then((metadata) => {
            setThisImageDetails(
              metadata.customMetadata as unknown as ImageDetails
            );
            const [day, month, year] = metadata.customMetadata.date.split("/");
            const date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );
            setSelectedDate(new Date(date));
            setOldPose(metadata.customMetadata.pose);
            setOldDate(formatDate(metadata.customMetadata.date));
          })
          .catch((error) => {
            console.error("Error getting metadata: ", error);
          });
      } catch (error) {
        console.error("Error getting metadata: ", error);
      }
    };

    fetchImageSize();
    getImageMetadata();
  }, []);

  const onDetailsTextChange = (key, value) => {
    const updatedDetails: ImageDetails = { ...thisImageDetails };
    updatedDetails[key] = value;
    setThisImageDetails(updatedDetails);
  };

  const onDateChange = (event, selectedDate) => {
    setShowCalendar(false);
    setSelectedDate(selectedDate);
    const updatedDetails: ImageDetails = { ...thisImageDetails };
    updatedDetails["date"] = selectedDate.toLocaleDateString();
    setThisImageDetails(updatedDetails);
  };

  const updateImageMetadata = async () => {
    if (!displayDetails) setDisplayDetails(true);
    else if (url) {
      const newMetadata = {
        customMetadata: {
          ...thisImageDetails,
        },
      };
      const currentUserId = auth.currentUser?.uid;
      const userRef = doc(db, "users", currentUserId);
      const date = formatDate(thisImageDetails["date"]);
      if (thisImageDetails.pose !== oldPose || date !== oldDate) {
        await updateDoc(userRef, {
          images: arrayRemove({ url: url, pose: oldPose, date: oldDate }),
        });
        await updateDoc(userRef, {
          images: arrayUnion({
            url: url,
            pose: thisImageDetails.pose,
            date: date,
          }),
        });
      }
      updateMetadata(getImageRef(url), newMetadata)
        .then((metadata) => {
          Alert.alert("New Details saved.");
          console.log("Metadata saved:", metadata.customMetadata);
        })
        .catch((error) => {
          Alert.alert("Could not update details.");
          console.error("Error updating image metadata: ", error);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "Inspect Page" }} />
      {!displayDetails ? (
        <ImageBackground
          source={{ uri: url }}
          style={{
            width: screenWidth,
            height: screenWidth * imageScale,
          }}
        />
      ) : (
        <ScrollView>
          <TouchableOpacity
            onPress={() => setDisplayDetails(false)}
            style={{
              alignSelf: "center",
              marginTop: "5%",
              marginBottom: "10%",
            }}
          >
            <Image
              source={{ uri: url }}
              style={{
                width: screenWidth / 2,
                height: (screenWidth / 2) * imageScale,
              }}
            />
          </TouchableOpacity>
          {keys &&
            keys.map((key, i) => {
              return (
                <View key={i} style={styles.detailsContainer}>
                  <Text style={{ marginLeft: "10%" }}>{key}: </Text>
                  {key !== "date" ? (
                    <TextInput
                      value={thisImageDetails[key]}
                      onChangeText={(value) => onDetailsTextChange(key, value)}
                      autoCapitalize="sentences"
                      style={styles.input}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setShowCalendar(true);
                      }}
                      style={styles.input}
                    >
                      <Text style={{ color: "white" }}>
                        {thisImageDetails["date"]}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          {showCalendar && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode={"date"}
              onChange={onDateChange}
            />
          )}
        </ScrollView>
      )}
      <TouchableOpacity
        onPress={() => updateImageMetadata()}
        style={styles.saveButton}
      >
        <Text style={styles.buttonText}>
          {!displayDetails ? "Details" : "Edit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    position: "relative",
    justifyContent: "center",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    position: "absolute",
    backgroundColor: "black",
    bottom: "5%",
    right: "5%",
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
  },
  input: {
    marginVertical: 5,
    width: (screenWidth * 66) / 200,
    height: (screenHeight * 6.6) / 200,
    backgroundColor: "black",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginLeft: "10%",
    color: "white",
  },
});

export default Inspect;
