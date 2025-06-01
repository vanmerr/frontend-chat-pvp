import { signInWithPopup } from 'firebase/auth';
import { auth, facebookProvider, googleProvider } from '../configs/firebase';

export const loginWithFacebook = async () => {
  const result = await signInWithPopup(auth, facebookProvider);
  const user = result.user;
  const token = await user.getIdToken();
  return { user, token };
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const token = await user.getIdToken();
  return { user, token };
};

