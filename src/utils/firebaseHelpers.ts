import { getDatabase, ref, get, push, update } from 'firebase/database';
import { Property } from '../contexts/PropertyContext';
import app from '../firebase/config';

const db = getDatabase(app);

const uploadPropertyToFirebase = async (property: Property): Promise<void> => {
  console.log(property);
  try {
    const propertiesRef = ref(db, 'properties');
    await push(propertiesRef, property);
    console.log('Propiedad subida con éxito a Firestore');
  } catch (error) {
    console.error('Error subiendo la propiedad:', error);
    throw error;
  }
};

export default uploadPropertyToFirebase;
