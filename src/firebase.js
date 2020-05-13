import firebase from '@firebase/app';
import '@firebase/analytics';
import 'firebase/functions';

let config = {
    apiKey: "AIzaSyCH1FWTusammkxpKrjtn7J-j06mi8i1l9U", 
    authDomain: "connect-e2fba.firebaseapp.com", 
    databaseURL: "https://connect-e2fba.firebaseio.com", 
    projectId: "connect-e2fba", 
    storageBucket: "connect-e2fba.appspot.com", 
    messagingSenderId: "1000958282595", 
    appId: "1:1000958282595:web:38171ca72fb567167de156", 
    measurementId: "G-G16RE3TQMY"
}
const connectFirebase = firebase.initializeApp(config)
export const connectFunctions = connectFirebase.functions()

connectFirebase.analytics();
connectFirebase.analytics().logEvent('notification_received');

export default connectFirebase