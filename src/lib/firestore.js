import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  setDoc,
  where,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

// --- Quizzes ---

export const subscribeToQuizzes = (callback, emisCode) => {
  let q = query(collection(db, "quizzes"));
  
  if (emisCode) {
    q = query(collection(db, "quizzes"), where("emisCode", "==", emisCode));
  } else {
    q = query(collection(db, "quizzes"), orderBy("order", "asc"));
  }

  return onSnapshot(q, (snapshot) => {
    const quizzes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(quizzes);
  });
};

/**
 * Add a new quiz
 * @param {Object} quizData 
 */
export const addQuizToDb = async (quizData) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quizData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding quiz: ", error);
    throw error;
  }
};

/**
 * Update an existing quiz
 * @param {string} id 
 * @param {Object} updatedData 
 */
export const updateQuizInDb = async (id, updatedData) => {
  try {
    const docRef = doc(db, "quizzes", id);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error updating quiz: ", error);
    throw error;
  }
};

/**
 * Delete a quiz
 * @param {string} id 
 */
export const deleteQuizFromDb = async (id) => {
  try {
    await deleteDoc(doc(db, "quizzes", id));
  } catch (error) {
    console.error("Error deleting quiz: ", error);
    throw error;
  }
};

// --- Attempts ---

export const subscribeToAttempts = (callback, emisCode) => {
  let q = query(collection(db, "attempts"));

  if (emisCode) {
    q = query(collection(db, "attempts"), where("emisCode", "==", emisCode));
  } else {
    q = query(collection(db, "attempts"), orderBy("timestamp", "desc"));
  }

  return onSnapshot(q, (snapshot) => {
    const attempts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(attempts);
  });
};

/**
 * Save a student's quiz attempt
 * @param {Object} attemptData 
 */
export const saveAttemptToDb = async (attemptData) => {
  try {
    const docRef = await addDoc(collection(db, "attempts"), {
      ...attemptData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving attempt: ", error);
    throw error;
  }
};

/**
 * Save or update student profile
 * @param {Object} studentData 
 */
export const saveStudentProfileToDb = async (studentData) => {
  if (!studentData.rollNo || !studentData.studentName) return;
  
  try {
    const docId = `${studentData.emisCode || 'GLOBAL'}_${studentData.rollNo}`;
    const docRef = doc(db, "students", docId);
    await setDoc(docRef, {
      ...studentData,
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving student profile: ", error);
  }
};

/**
 * Save or update teacher profile
 * @param {string} uid 
 * @param {Object} teacherData 
 */
export const saveTeacherProfileToDb = async (uid, teacherData) => {
  try {
    const docRef = doc(db, "teachers", uid);
    await setDoc(docRef, {
      ...teacherData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error saving teacher profile: ", error);
    throw error;
  }
};

/**
 * Get teacher profile by UID
 * @param {string} uid 
 */
export const getTeacherProfile = async (uid) => {
  try {
    const docRef = doc(db, "teachers", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching teacher profile: ", error);
    throw error;
  }
};
