const express = require('express')
const dialogFlow = require('@google-cloud/dialogflow')
const app = express()
const server = require('http').createServer(app)
const uuid = require('uuid')
const io = require('socket.io')(server)

require('dotenv').config()

const port = process.env.PORT || 5000
const projectId = process.env.PROJECT_ID

app.use(express.static(__dirname + '/view'))
app.use(express.static(__dirname + '/public'))

io.on('connection', socket => {
    console.log('User connected')
    socket.on('chat', message =>{
        //console.log(message)
        const knowTime = [
            'what','why','can',"don't",'how','could','please',
            'will','is','tell','the','it','me','you','now',
        ]
        const tempArray = message.split(' ')
        const check = tempArray.includes('time') && knowTime.some(item=>tempArray.includes(item))
        if(check){
            const date = new Date()
            let hours = date.getHours()
            let minutes = date.getMinutes()
            const period = hours<=12 ? 'AM' : 'PM'
            if(hours===0) hours = 12
            else if(hours >12) hours = hours - 12
            hours = hours< 10 ? ('0'+hours) : hours
            minutes = minutes< 10 ? ('0'+minutes) : minutes
            const time = `${hours} : ${minutes} ${period}`
            return socket.emit('reply', time)
        }
        const connectApi = async (projectId) =>{
            try{
                const sessionId = uuid.v4()
                const sessionClient = new dialogFlow.SessionsClient({
                    keyFilename: './nlpvchat-wobu-b1eb404649b2.json'
                })
                const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId)
                const request = {
                    session: sessionPath,
                    queryInput: {
                        text: {
                            text: message,
                            languageCode: 'en-US'
                        }
                    }
                }
                const response = await sessionClient.detectIntent(request)
                //console.log(response)
                const result = response[0].queryResult.fulfillmentText
                socket.emit('reply', result)
            }
            catch(err){
                console.log(err)
            }
        }
        connectApi(projectId)
    })
})

app.get('/', (req,res)=>{
    res.sendFile('index.html')
})

server.listen(port,()=>console.log(`Server listening on port ${port}`))