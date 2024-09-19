const express = require('express');
const http = require('http');
const cors = require('cors');

// Printer Dependencies
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Home');
});

// SENDS THE PAYLOAD TO PRINT TRIGGER ENDPOINT
app.post('/que_sys/printReceipt', (req, res) => {

    const { vID, pId, queueToken, dateInfo } = req.body
    console.log(req.body)
    // Initialize USB adapter for the printer
    const device = new escpos.USB(0x04B8, 0x0E27);

    // Create a new Printer instance with the USB device
    const printer = new escpos.Printer(device);

    // Open the USB device connection and perform printing operations
    device.open((error) => {

        if (error) {
            console.error("Error opening device:", error);
            return;
        }

        console.log('Connected to USB ESC/POS printer');

        // Start printing commands
        printer
            .font('b')
            .align('ct')
            .size(1, 1)
            .text('MEDICAL CENTER IMUS')
            .feed(1)
            .text('Queue Token:')
            .font('b')
            .size(2, 2)
            .text('+------------------+')
            .text(`|   ${queueToken}   |`)
            .text('+------------------+')
            .feed(1)
            .size(1, 1)
            .text(`Date and Time Issued : `)
            .feed(1)
            .text(`${dateInfo}`)
            .feed(2)
            .cut()
            .close();
    });

    res.status(201).json("Print Successfully")

})


app.use((err, req, res) => {
    console.log(err)
    res.status(404).send("PAGE NOT FOUND!");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
