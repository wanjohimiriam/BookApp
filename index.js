const express = require('express');
const bodyParser = require('body-parser');
const AfricasTalking = require('africastalking');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const username = 'nGROCK'; // Replace with your Africa's Talking username
const apiKey = 'eb2dbeb0df01fa1d9110a2141912da5276469cb9a477c225501ae78996c5f848'; // Replace with your Africa's Talking API key

// Initialize Africa's Talking SDK

const africastalking = AfricasTalking({
    username,
    apiKey,
});

const ussd = africastalking.USSD;
const sms = africastalking.SMS

// Database to store bookings
let bookings = [];
// https://twitter.com
app.post('/ussd', (req, res) => {
    // Read the variables sent via POST from Africa's Talking
    const {
        sessionId,
        serviceCode,
        phoneNumber,
        text,
    } = req.body;

    let response = '';

    if (text === '') {
        // This is the first request. Note how we start the response with CON
        response = `CON Welcome to the Booking App!
        1. Book a room
        2. View bookings`;
    } else if (text === '1') {
        // User wants to book a room
        response = `CON Please provide the following details:
        Enter your name:`;
    } else if (text.startsWith('1*')) {
        // User is in the process of booking a room
        const bookingDetails = text.split('*').slice(1);
        const [name, date, time] = bookingDetails;
        const booking = {
            name,
            date,
            time
        };
        bookings.push(booking);

        // This is a terminal request. Note how we start the response with END
        response = `END Thank you, ${name}! Your booking is confirmed for ${date} at ${time}.`;

    } else if (text === '2') {
        // User wants to view bookings
        if (bookings.length === 0) {
            response = `END No bookings available.`;
        } else {
            response = `CON Your bookings:
            `;
            bookings.forEach((booking, index) => {
                response += `${index + 1}. ${booking.name} - ${booking.date} at ${booking.time}
                `;
            });
            response += `Reply with the booking number to view details.`;
        }
    } else if (text.startsWith('2*')) {
        // User wants to view a specific booking
        const bookingNumber = Number(text.split('*')[1]);
        if (bookingNumber > 0 && bookingNumber <= bookings.length) {
            const booking = bookings[bookingNumber - 1];
            response = `END Booking details:
            Name: ${booking.name}
            Date: ${booking.date}
            Time: ${booking.time}`;
        } else {
            response = `END Invalid booking number.`;
        }
    }

    // Send the response back to the Africa's Talking USSD API
    const options = {
        // Set the numbers you want to send to in international format
        to: [' +254796537064'],
        // Set your message
        message:  response,
        // Set your shortCode or senderId
    }

    // That’s it, hit send and we’ll take care of the rest
    sms.send(options)
        .then((data)=>{
            console.log("am response", data)
            return data
        })
        .catch(console.log);
  
    
    response = 'END Thank you for booking';
    
});
app.get("/", (req, res) => {
    res.send("Success Message");
  });
app.listen(5000, () => {
    console.log('Booking app is running on port 5000');
});
