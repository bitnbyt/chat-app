const socket = io()



//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $location = document.querySelector('#location')

// templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// const autoscroll = () => {
//     // New message element
//     const $newMessage = $messages.lastElementChild

//     // Height of the new message
//     const newMessageStyles = getComputedStyle($newMessage)
//     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
//     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//     // Visible height
//     const visibleHeight = $messages.offsetHeight

//     // Height of messages container
//     const containerHeight = $messages.scrollHeight

//     // How far have I scrolled?
//     const scrollOffset = $messages.scrollTop + visibleHeight

//     if (containerHeight - newMessageHeight <= scrollOffset) {
//         $messages.scrollTop = $messages.scrollHeight
//     }
// }

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)

})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $location.insertAdjacentHTML('beforeend', html)
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        users,
        room
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled') 

    const message = e.target.elements.message.value 
    socket.emit("sendMessage", message,(error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log("Message Delivered!")
    })
})


$locationButton.addEventListener('click', (e) => {
    
    $locationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert("please switch to latest chrome browser!")
    }
    navigator.geolocation.getCurrentPosition((position) => {
        // $locationButton.removeAttribute('disabled')
        socket.emit("send-location",{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },() => {
            $locationButton.removeAttribute('disabled')
            console.log("Location Shared")
        })
    })
})

socket.emit('join', {username, room}, (error) =>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})


// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//    socket.emit('increment')
//     // console.log('I want the count to increase by one for each time i click on button. you gotta server')
// })


