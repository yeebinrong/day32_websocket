const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const expressWS = require('express-ws')

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const PARTICIPANTS = {}

const app = express()
const appWS = expressWS(app)

app.use(morgan('combined'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const broadcastMsg = (chat) => {
    for (let i in PARTICIPANTS) {
        PARTICIPANTS[i].send(chat)
    }
}

// can do this if got multiple chat rooms, express logic applies
// app.ws('/chat/:multiplechatrooms', (ws, req) => {
app.ws('/chat', (ws, req) => {
    const name = req.query.name
    console.info(`New websocket connection: ${name}`)
    PARTICIPANTS[name] = ws
    ws.participantName = name
    const chat = JSON.stringify({
        from: 'Admin',
        message: `${name} has joined the room.`,
        ts: (new Date().toString())
    })
    // broadcast to everyone in the room
    broadcastMsg(chat)
        
    ws.on('message', (data) => {
        console.info(`Message incoming: ${data}`)
        const chat = JSON.stringify({
            from: name,
            message: data,
            ts: (new Date().toString())
        })
        // broadcast to everyone in the room
        broadcastMsg(chat)
    })

    ws.on('close', () => {
        console.info(`Closing websocket connection for ${name}`)
        // close our end of connection
        PARTICIPANTS[name].close()
        // remove ourself from the room
        delete PARTICIPANTS[name]

        const chat = JSON.stringify({
            from: 'Admin',
            message: `${name} has left the room.`,
            ts: (new Date().toString())
        })
        broadcastMsg(chat)
    })
})

app.listen(PORT, () => {
    console.info(`Application is listening PORT ${PORT} at ${new Date()}`)
})