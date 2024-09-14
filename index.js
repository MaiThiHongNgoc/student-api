const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors'); // Add this line
require('dotenv').config(); // Nạp biến môi trường từ file .env

const app = express();
app.use(express.json()); // Để đọc dữ liệu JSON từ request body
app.use(cors()); // Enable CORS for all routes

// Khởi tạo mội trường SDK của Firebase
admin.initializeApp({
    credential: admin.credential.cert({
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Xử lý ký tự xuống dòng
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
  });
  

const db = admin.firestore();
const collection = db.collection('students'); // Collection students trong Firestore

// 1. Create a new student: POST
app.post('/students', async (req, res) => {
  try {
    // Dữ liệu sinh viên nhận từ request body có thể chứa các trường mới
    const student = req.body;
    const docRef = await collection.add(student);
    res.status(201).send({ id: docRef.id, message: 'Student created successfully' });
  } catch (error) {
    res.status(500).send('Error creating student: ' + error.message);
  }
});

// 2. Read all students: GET
app.get('/students', async (req, res) => {
    try {
      console.log('Fetching students...');
      const snapshot = await collection.get();
      console.log('Snapshot received');
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Error fetching students', details: error.message });
    }
  });

  
  app.get('/test', async (req, res) => {
    try {
      const testSnapshot = await db.collection('test').get();
      res.status(200).json({ message: 'Test query successful', count: testSnapshot.size });
    } catch (error) {
      console.error('Error in test query:', error);
      res.status(500).json({ error: 'Error in test query', details: error.message });
    }
  });
  
  

// 3. Read a student by ID: GET/id
app.get('/students/:id', async (req, res) => {
  try {
    const doc = await collection.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('Student not found');
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error fetching student: ' + error.message);
  }
});

// 4. Update a student by ID: PUT/id
app.put('/students/:id', async (req, res) => {
  try {
    // Các trường mới hoặc cập nhật sẽ được lấy từ request body
    const updatedStudent = req.body;
    await collection.doc(req.params.id).update(updatedStudent);
    res.status(200).send('Student updated successfully');
  } catch (error) {
    res.status(500).send('Error updating student: ' + error.message);
  }
});

// 5. Delete a student by ID: DELETE/id
app.delete('/students/:id', async (req, res) => {
  try {
    await collection.doc(req.params.id).delete();
    res.status(200).send('Student deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting student: ' + error.message);
  }
});

// Chạy server với port online hoặc 3000 local
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
