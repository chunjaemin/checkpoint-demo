import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useUserStore } from '@/scripts/store/userStore';
import { useAddTeamDataStore } from '@/scripts/store/addTeamDataStore';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function KakaoMapScreen() {
    const webviewRef = useRef(null);
    const { user, setUser } = useUserStore();
    const setSelectedSpace = useUserStore((state) => state.setSelectedSpace);
    const { teamData } = useAddTeamDataStore();
    const router = useRouter();

    const insets = useSafeAreaInsets();

    const [initialLat, setInitialLat] = useState(37.5665); // 기본값: 서울시청
    const [initialLng, setInitialLng] = useState(126.9780);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setInitialLat(location.coords.latitude);
                setInitialLng(location.coords.longitude);
            }
        })();
    }, []);

    const handleConfirmPress = () => {
        webviewRef.current?.injectJavaScript(`confirmPlace(); true;`);
    };

    const handleMapMessage = (event) => {
        try {
            const parsed = JSON.parse(event.nativeEvent.data);
            if (parsed.confirmed && parsed.place) {
                const newTeamSpace = {
                    ...teamData,
                    location: parsed.place,
                };

                const updatedSpaces = [...(user.spaces || []), newTeamSpace];

                setUser({
                    ...user,
                    spaces: updatedSpaces,
                });
                setSelectedSpace(updatedSpaces.length - 1);
                // ✅ Alert로 피드백
                Alert.alert(
                    '팀 생성 완료',
                    '선택한 위치로 팀이 생성되었습니다.',
                    [
                        {
                            text: '확인',
                            onPress: () => router.replace('/team'),
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (err) {
            
        }
    };

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=5bc2c2c9222ca281718b0d6e5d8d8cf6&libraries=services"></script>
            <style>
            html, body, #map {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
            }
            .instruction-banner {
                position: absolute;
                top: __INSETS_TOP__;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 255, 255, 0.95);
                color: #1a1a1a;
                font-size: 16px;
                font-weight: 600;
                padding: 10px 18px;
                border: 1px solid #ddd;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10;
                text-align: center;
                max-width: 80%;
                with: auto;
                white-space: nowrap;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            </style>
        </head>
        <body>
            <div class="instruction-banner">매장 위치를 지정해주세요</div>
            <div id="map"></div>
            <script>
            window.onerror = function(message, source, lineno, colno, error) {
                window.ReactNativeWebView?.postMessage(
                '[JS ERROR] ' + message + ' at ' + lineno + ':' + colno
                );
            };

            let selectedPlace = null;
            let selectedMarker = null;
            let selectedOverlay = null;

            window.onload = function () {
                if (!window.kakao || !kakao.maps) {
                window.ReactNativeWebView?.postMessage("🔴 Kakao SDK NOT loaded ❌");
                return;
                }

                const currentPos = new kakao.maps.LatLng(${initialLat}, ${initialLng});

                var map = new kakao.maps.Map(document.getElementById('map'), {
                center: currentPos,
                level: 3
                });

                initMap(map);

                function initMap(map) {
                kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                    const latlng = mouseEvent.latLng;

                    if (selectedMarker) selectedMarker.setMap(null);
                    if (selectedOverlay) selectedOverlay.setMap(null);

                    selectedMarker = new kakao.maps.Marker({
                    map: map,
                    position: latlng
                    });

                    selectedOverlay = new kakao.maps.CustomOverlay({
                    map: map,
                    position: latlng,
                    content: '<div style="background: #4285f4; color: white; padding: 4px 10px; border-radius: 6px; font-size: 13px;">내 매장 위치</div>',
                    yAnchor: 1.5
                    });

                    selectedPlace = {
                    name: '사용자 지정 위치',
                    lat: latlng.getLat(),
                    lng: latlng.getLng()
                    };

                    window.ReactNativeWebView?.postMessage("🟢 사용자 지정 위치 선택됨: " + JSON.stringify(selectedPlace));
                });

                var ps = new kakao.maps.services.Places();
                var markers = [];

                function clearMarkers() {
                    markers.forEach(m => m.setMap(null));
                    markers = [];
                }

                window.confirmPlace = function () {
                    if (!selectedPlace) {
                    alert('장소를 먼저 선택해주세요!');
                    return;
                    }
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ confirmed: true, place: selectedPlace }));
                }
                }
            };
            </script>
        </body>
        </html>
        `;
    const htmlWithInset = html.replace('__INSETS_TOP__', `${insets.top + 10}px`);

    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={webviewRef}
                originWhitelist={['*']}
                source={{ html: htmlWithInset }}
                javaScriptEnabled
                geolocationEnabled={true}
                onMessage={handleMapMessage}
            />
            <TouchableOpacity
                style={[
                    styles.button,
                    { bottom: insets.bottom + 10 } // SafeArea 고려
                ]} onPress={handleConfirmPress}>
                <Text style={styles.buttonText}>장소 확정 및 팀 생성</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#3087fa',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        zIndex: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
