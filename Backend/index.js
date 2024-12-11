const express = require('express');
const mysql = require('mysql2'); //yaha se mysql connection
const cors = require('cors'); 
const app = express();
const port = 3000;


app.use(cors());

//middleware
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',   
    password: 'cdac', 
    database: 'ticket_booking' 
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// book seat ka endpoint
app.post('/book-seat', (req, res) => {
    const { seat_number } = req.body;
    console.log('Received seat number:', seat_number); // Log par seat no receive hoga

    if (!seat_number) {
        return res.status(400).send('Seat number is required');
    }

    // if the seat is already booked
    const checkSql = 'SELECT * FROM booked_seats WHERE seat_number = ?';
    db.query(checkSql, [seat_number], (err, result) => {
        if (err) {
            console.error('Error checking seat availability:', err);
            return res.status(500).send('Error checking seat availability');
        }

        if (result.length > 0) {
            console.log('Seat is already booked:', seat_number);
            return res.status(400).send('Seat is already booked');
        }

        // Insert the seat
        const sql = 'INSERT INTO booked_seats (seat_number, status) VALUES (?, ?)';
        db.query(sql, [seat_number, 'booked'], (err, result) => {
            if (err) {
                console.error('Error booking seat:', err);
                return res.status(500).send('Error booking seat');
            }
            console.log('Seat booked successfully:', seat_number); // Log message
            res.status(201).send({ success: true, message: 'Seat booked successfully' });
        });
    });
});

// cancel  booking ka endpoint
app.delete('/cancel-booking', (req, res) => {
    const { seat_number, reason } = req.body;

    // Query to delete the seat
    const query = 'DELETE FROM booked_seats WHERE seat_number = ?';
    db.query(query, [seat_number], (err, result) => {
        if (err) {
            console.error('Error cancelling booking:', err);
            return res.status(500).send('Error cancelling booking');
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Seat not found or already canceled' });
        }

        console.log(`Seat Number: ${seat_number} was cancelled for the following reason: ${reason}`);

        res.status(200).json({ message: 'Booking cancelled successfully!' });
    });
});
app.get('/booked-seats', (req, res) => {
    const query = 'SELECT * FROM booked_seats';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching booked seats:', err);
            return res.status(500).send({ success: false, message: 'Error fetching booked seats' });
        }

        res.status(200).send({ success: true, data: results });
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
