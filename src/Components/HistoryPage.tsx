import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Sport } from "./HomePage";
import { collection, getFirestore, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HistoryPage({ route }) {
    const { darkMode } = route.params;
    const db = getFirestore();
    const user = getAuth().currentUser;
    const [sports, setSports] = useState<any[]>([]); const [headerColor, setHeaderColor] = useState(darkMode ? '#191828' : '#FFF');
    const [titleColor, setTitleColor] = useState(darkMode ? '#FFF' : '#000');
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: '',
            headerStyle: {
                backgroundColor: darkMode ? '#191828' : '#FFF',
            }
        });
    }, [navigation, headerColor, titleColor]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const unlikedSportsRef = collection(db, "Users", user.uid, "UnlikedSports");
                    const likedSportsRef = collection(db, "Users", user.uid, "likedSports");
                    const unlikedSportsSnapshot = await getDocs(unlikedSportsRef);
                    const likedSportsSnapshot = await getDocs(likedSportsRef);
                    const unlikedSportsDocs = unlikedSportsSnapshot.docs.map((doc) => doc.data());
                    const likedSportsDocs = likedSportsSnapshot.docs.map((doc) => doc.data());
                    const totalSize = Math.max(unlikedSportsDocs.length, likedSportsDocs.length);
                    const sportsData: any[] = [];

                    for (let i = 0; i < totalSize; i++) {
                        if (i < likedSportsDocs.length) {
                            likedSportsDocs[i].icon = 'heart';
                            sportsData.push(likedSportsDocs[i]);
                        }
                        if (i < unlikedSportsDocs.length) {
                            unlikedSportsDocs[i].icon = 'close';
                            sportsData.push(unlikedSportsDocs[i]);
                        }
                    }

                    setSports(sportsData);
                }
            } catch (error) {
                console.log("Error fetching sports:", error);
            }
        };

        fetchData();
    }, [db, user]);

    const handleLogOut = () => {
        signOut(getAuth()).then(() => {
            navigation.navigate('Login', darkMode);
        })
            .catch((error) => {
                console.log(error);
            })
    }

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={[styles.itemContainer, { backgroundColor: darkMode ? '#2c2b3e' : '#d3d3d6' }]}>
                <Image source={{ uri: item.strSportThumb }} style={styles.sportImage} />
                <View style={styles.overlay}>
                    <Text style={styles.textOverlay}>{item.strSport}</Text>
                </View>
                <Ionicons
                    name={item.icon}
                    size={35}
                    color={item.icon === 'heart' && darkMode
                        ? 'white'
                        : item.icon === 'heart' && !darkMode
                            ? '#1050D6' : 'red'} style={styles.icon} />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: darkMode ? '#191828' : '#fff' }]}>
            <Text style={[styles.historyText, { color: darkMode ? '#fff' : '#000' }]}>History</Text>
            <FlatList
                data={sports}
                keyExtractor={(item) => item.idSport}
                renderItem={renderItem}
                contentContainerStyle={styles.listContentContainer}
            />
            <View style={[styles.navigationBar, { backgroundColor: darkMode ? '#2c2b3e' : '#d3d3d6' }]}>
                <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navBarButtonText}>
                        <Ionicons name="home" size={20} color="black" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarButton} onPress={() => navigation.navigate('History', { darkMode })}>
                    <Text style={styles.navBarButtonText}>
                        <Ionicons name="ellipse" size={20} color="black" />
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarButton} onPress={handleLogOut}>
                    <Ionicons name="log-out" size={20} color="black" />
                </TouchableOpacity>
            </View>
        </View>

    );
}


const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  historyText: {
    fontSize: windowWidth * 0.1,
    paddingStart: windowWidth * 0.04,
    paddingBottom: windowWidth * 0.04
  },
  listContentContainer: {
    paddingHorizontal: windowWidth * 0.04,
    width: windowWidth
  },
  itemContainer: {
    marginBottom: windowWidth * 0.04,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: 'row',
    alignItems: 'center',
    height: windowWidth * 0.2
  },
  sportImage: {
    width: '80%',
    aspectRatio: 16 / 9
  },
  icon: {
    alignSelf: 'center',
    paddingEnd: windowWidth * 0.04,
    marginLeft: 'auto'
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: windowWidth * 0.1,
    paddingHorizontal: windowWidth * 0.04,
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: windowWidth * 0.15,
    marginBottom: windowWidth * 0.08,
    borderRadius: windowWidth * 0.15
  },
  navBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navBarButtonText: {
    fontSize: windowWidth * 0.04,
    fontWeight: 'bold',
    color: '#000'
  },
  overlay: {
    position: 'absolute',
    bottom: windowWidth * 0.004,
    left: windowWidth * 0.01
  },
  textOverlay: {
    color: 'white',
    fontSize: windowWidth * 0.06
  }
});

