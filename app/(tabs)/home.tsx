import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import useAuth from "../hooks/useAuth";
import withAuthentication from "../hocs/withAuthentication";
import { arrayRemove, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase.config";
import { deleteObject, ref } from "firebase/storage";
import { imageFolderPath } from "../constants";

const HomePage = () => {
  const router = useRouter();
  const user = useAuth();
  const [images, setImages] = useState([]);
  // useEffect(() => {
  //   // Retrieve the document from Firestore
  //   const getImageUrl = async () => {
  //     try {
  //       const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  //       if (docSnap.exists()) {
  //         // Get the image URL from the document data
  //         setImages(docSnap.data().images);
  //       } else {
  //         console.log("No such document!");
  //       }
  //     } catch (error) {
  //       console.error("Error getting document:", error);
  //     }
  //   };

  //   getImageUrl();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log("am intrat");
      const getImageUrl = async () => {
        try {
          const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (docSnap.exists()) {
            // Get the image URL from the document data
            setImages(docSnap.data().images);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
        }
      };

      getImageUrl();
    }, [])
  );

  const deleteImage = async (url, index) => {
    const startIndex = url.indexOf("%2F") + 3;
    const endIndex = url.indexOf("?alt=media");
    const imageId = url.substring(startIndex, endIndex);
    const imageRef = ref(storage, imageFolderPath + imageId);
    deleteObject(imageRef)
      .then(() => {
        Alert.alert("Image deleted.");
      })
      .catch((error) => {
        console.log(error);
      });

    const currentUserId = auth.currentUser?.uid;
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, {
      images: arrayRemove(url),
    });

    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.ImageContainer}
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
        }}
        horizontal={false}
      >
        {images.map((image, i) => {
          console.log(image);
          return (
            <TouchableOpacity
              style={{
                padding: 1,
              }}
              key={i}
              onLongPress={() => deleteImage(image, i)}
            >
              <Image
                source={{ uri: image }}
                style={[
                  {
                    width: Dimensions.get("window").width / 5 - 2,
                    height: (Dimensions.get("window").width / 5 - 2) * 1.5,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 130,
    borderRadius: 4,
    backgroundColor: "#14274e",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  ImageContainer: {
    width: "100%",
  },
});

export default withAuthentication(HomePage);