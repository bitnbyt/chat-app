const users = []

const addUser = ({id, username, room}) =>{
    // data cleaning
    username = username.trim().toLowerCase()
    room  = room.trim().toLowerCase()

    // data validating 
    if(!username || !room) {
        return {error: "username and room must fill"}
    }

    // check exiting user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    // validate existing user
    if(existingUser) {
        return {error : "username already taken. Try with other name"}
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user } 
    
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })

}

const getUsersInRoom = (room) => {
    return users.filter((user) => {
        return user.room == room
    })
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}