import React, { useEffect, useState } from 'react';
import { View, Text, Animated, PanResponder, Dimensions, StyleSheet, Image, TouchableOpacity, Switch, Modal } from 'react-native';
import axios from 'axios';
import { getFirestore, collection, doc, addDoc, getDocs, where, query, deleteDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export interface Sport {
    ho: any;
    idSport: any,
    strSport: String,
    strFormat: String,
    strSportThumb: string,
    strSportIconGreen: string,
    strSportDescription: String
}
export default function HomeScreen({ route }) {
    const [sports, setSports] = useState<Sport[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pan] = useState(new Animated.ValueXY());
    const [darkMode, setDarkMode] = useState(route.params);
    const [modalVisible, setModalVisible] = useState(false);
    const [headerColor, setHeaderColor] = useState(darkMode ? '#191828' : '#FFF');
    const [titleColor, setTitleColor] = useState(darkMode ? '#FFF' : '#000');
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: 'Sports',
            headerStyle: {
                backgroundColor: headerColor,
            },
            headerTitleStyle: {
                color: titleColor
            }
        });
    }, [navigation, headerColor, titleColor]);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dx > 120) {
                handleSwipe('right', sports[currentIndex]);
            } else if (gesture.dx < -120) {
                handleSwipe('left', sports[currentIndex]);
            } else {
                resetPosition();
            }
        },
    });

    const db = getFirestore();
    const handleSwipe = async (direction: 'left' | 'right', sport: Sport) => {
        const animationDuration = 250;
        if (direction === 'left') {
            try {
                const user = getAuth().currentUser;
                if (!!user) {
                    const unlikedSports = collection(db, 'Users', user.uid, 'UnlikedSports');
                    const likedSports = collection(db, 'Users', user.uid, 'likedSports');
                    const likedQuery = query(likedSports, where('idSport', '==', sport.idSport));
                    const snapshotLiked = await getDocs(likedQuery);
                    const unlikedQuery = query(unlikedSports, where('idSport', '==', sport.idSport));
                    const snapshotUnliked = await getDocs(unlikedQuery);

                    if (!snapshotLiked.empty) {
                        /**
                         * If user doesn't like the current sport but it has liked it before
                         * that sport will pass from liked to unliked
                         */
                        const docToDelete = snapshotLiked.docs[0];
                        await deleteDoc(doc(db, 'Users', user.uid, 'likedSports', docToDelete.id));

                    }
                    if (snapshotUnliked.empty) {
                        /**
                         * If sport doesn't exist on unlikedSports it will be
                         * add on unlikedSports array
                         */
                        await addDoc(unlikedSports, sport);
                    }
                }

            }
            catch (error) {
                console.log(error);
            }
        }
        else {
            try {
                const user = getAuth().currentUser;
                if (!!user) {
                    const likedSports = collection(db, 'Users', user.uid, 'likedSports');
                    const unlikedSports = collection(db, 'Users', user.uid, 'UnlikedSports');
                    const likedQuery = query(likedSports, where('idSport', '==', sport.idSport));
                    const snapshotLiked = await getDocs(likedQuery);
                    const unlikedQuery = query(unlikedSports, where('idSport', '==', sport.idSport));
                    const snapshotUnliked = await getDocs(unlikedQuery);
                    if (!snapshotUnliked.empty) {
                        /**
                         * If user likes the current sport but it has disliked it before
                         * that sport will pass from unliked to liked
                         */
                        const docToDelete = snapshotUnliked.docs[0];
                        await deleteDoc(doc(db, 'Users', user.uid, 'UnlikedSports', docToDelete.id));

                    }
                    if (snapshotLiked.empty) {
                        /**
                         * If sport doesn't exist on likedSports it will be
                         * add on likedSports array
                         */
                        await addDoc(likedSports, sport);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        Animated.timing(pan, {
            toValue: { x: direction === 'right' ? Dimensions.get('window').width : -Dimensions.get('window').width, y: 0 },
            duration: animationDuration,
            useNativeDriver: false,
        }).start(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % sports.length);
            resetPosition();
        });
    };

    const resetPosition = () => {
        Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    const cardStyles = [
        styles.card,
        {
            transform: [{ translateX: pan.x }],
            backgroundColor: darkMode ? '#191828' : '#FFF'
        },
    ];

    const toggleDarkMode = () => {
        setHeaderColor(!darkMode ? '#191828' : '#FFF');
        setTitleColor(darkMode ? '#191828' : '#FFF');
        setDarkMode(!darkMode);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleLogOut = () => {
        signOut(getAuth()).then(() => {
            navigation.navigate('Login', darkMode);
        })
            .catch((error) => {
                console.log(error);
            })
    }

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await axios.get('https://apimocha.com/playgreen/sports');
                setSports(response.data.sports);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSports();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: darkMode ? '#191828' : '#fff' }]}>
            <View style={styles.navButtonContainer}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, { marginRight: 70, backgroundColor: darkMode ? '#2c2b3e' : '#d3d3d6' },]} onPress={() => handleSwipe('left', sports[currentIndex])}>
                        <Ionicons name="close" size={20} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleSwipe('right', sports[currentIndex])}>
                        <Ionicons name="heart" size={30} color="black" />
                    </TouchableOpacity>
                </View>
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
                    <TouchableOpacity style={styles.navBarButton}>
                        <Ionicons name="log-out" size={20} color="black" onPress={handleLogOut} />
                    </TouchableOpacity>
                </View>
            </View>
            {sports.map((sport, index) => {
                if (index < currentIndex) {
                    return null;
                } else if (index === currentIndex) {
                    return (
                        <Animated.View
                            key={sport.idSport}
                            style={[cardStyles, styles.cardMain]}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.cardImageContainer}>
                                <Image source={{ uri: sport.strSportThumb }} style={styles.cardImage} resizeMode='cover' />
                                <Modal visible={modalVisible} animationType="slide" transparent>
                                    <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                            <Image source={{ uri: sport.strSportIconGreen }} style={styles.modalImage} />
                                            <Text style={styles.modalDescription}>{sport.strSportDescription}</Text>
                                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                                <Text style={styles.closeButtonText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                                <Text style={styles.sportName}>{sport.strSport}</Text>
                                <Image source={{ uri: sport.strSportIconGreen }} style={styles.icon} />
                                <Switch
                                    style={styles.darkModeSwitch}
                                    value={darkMode}
                                    onValueChange={toggleDarkMode}
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={'#f4f3f4'}
                                />
                            </View>
                        </Animated.View>
                    );
                } else if (index === currentIndex + 1) {
                    return (
                        <Animated.View key={sport.idSport} style={[cardStyles, styles.cardSecondary]}></Animated.View>
                    );
                } else {
                    return null;
                }
            })}
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '90%',
    borderRadius: 10,
    elevation: 3
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  modalImage: {
    width: windowWidth * 0.8,
    height: windowWidth * 0.8,
    marginBottom: 10
  },
  modalDescription: {
    fontSize: windowWidth * 0.04,
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10
  },
  closeButtonText: {
    color: '#fff',
    fontSize: windowWidth * 0.04
  },
  cardMain: {
    zIndex: 2,
    height: windowHeight * 0.65
  },
  cardSecondary: {
    zIndex: -1,
    opacity: 0.5,
    height: '65%'
  },
  cardImageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardImage: {
    flex: 1,
    width: '100%',
    height: undefined,
    borderRadius: 10,
    aspectRatio: 16 / 9
  },
  sportName: {
    position: 'absolute',
    bottom: windowHeight * 0.02,
    left: windowWidth * 0.02,
    fontSize: windowWidth * 0.08,
    color: '#fff',
    fontWeight: 'bold'
  },
  icon: {
    position: 'absolute',
    top: windowWidth * 0.02,
    left: windowWidth * 0.02,
    width: windowWidth * 0.08,
    height: windowWidth * 0.08
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    marginTop: windowHeight * 0.04
  },
  button: {
    width: windowWidth * 0.15,
    height: windowWidth * 0.15,
    borderRadius: windowWidth * 0.075,
    backgroundColor: '#1050D6',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 5px #1050D6'
  },
  buttonText: {
    fontSize: windowWidth * 0.06
  },
  darkModeButton: {
    position: 'absolute',
    top: windowHeight * 0.04,
    right: windowWidth * 0.04,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5
  },
  darkModeButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  darkModeSwitch: {
    position: 'absolute',
    top: windowWidth * 0.01,
    right: windowWidth * 0.01,
    zIndex: 2
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: windowHeight * 0.08,
    paddingHorizontal: windowWidth * 0.04,
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: windowHeight * 0.05,
    borderRadius: windowHeight * 0.04
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
  navButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: windowHeight * 0.04
  }
});
