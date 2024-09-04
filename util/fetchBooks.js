import instance from "./instance"

const fetchBooks = async () => {
    const response = await instance.get("/books?populate=*")
    return response.data.data
}

export default fetchBooks