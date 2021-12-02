const socket = io()
const btn = document.querySelector('button')
const input = document.querySelector('#input')
const output = document.querySelector('#output')

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const recognition = new SpeechRecognition()
recognition.lang = 'en-US'
recognition.interimResults = false

btn.addEventListener('click',()=>{
    recognition.start()
})

recognition.onresult = (e) =>{
    const text = e.results[0][0].transcript
    //console.log(text)
    input.textContent = text
    socket.emit('chat', text)
}

if (!('speechSynthesis' in window)) {
    alert("Sorry, your browser doesn't support text to speech!😣")
}

let voices
const speech = window.speechSynthesis
if(speech.onvoiceschanged !== undefined){
	speech.onvoiceschanged = () => populateVoiceList()
}
function populateVoiceList(){
	const voiceList = speech.getVoices()
    voices = voiceList
}

function speechSynth(text){
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voices[2]
    utterance.volume = 1
    utterance.rate = 1.25
    utterance.pitch = 3
    window.speechSynthesis.speak(utterance)
    output.textContent = text
}

socket.on('reply', reply =>{
    speechSynth(reply)
})