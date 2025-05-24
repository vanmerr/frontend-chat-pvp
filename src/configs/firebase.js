import { initializeApp } from 'firebase/app';
import { getAuth, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import serviceKey from './serviceKey.json';

const firebaseConfig = {
  apiKey: serviceKey.apiKey,
  authDomain: serviceKey.authDomain,
  projectId: serviceKey.projectId,
  appId: serviceKey.appId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const facebookProvider = new FacebookAuthProvider();
export const googleProvider = new GoogleAuthProvider();
