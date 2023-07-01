const BookMark = require('../models/BookMark');

const getAllBookMarks = async (req, res) => {
    const user = req.user;
    try {
        const findAllBooksMarks = await BookMark.find({ user }).populate({
            path: 'post',
            populate: {
                path: 'author',
                select: '-password -updatedAt -createdAt'
            }
        }).select('-user').sort({ createdAt: -1 });
        return res.status(200).json(findAllBooksMarks);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}
const addToBookMark = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    try {
        const isBookMarked = await BookMark.find({ $and: [{ post: id }, { user }] });
        if (isBookMarked.length > 0) {
            return res.status(401).json({ message: 'Already bookmarked' });
        }

        const newBookMark = new BookMark({
            user,
            post: id,
        })
        await newBookMark.save()
        return res.status(201).json({ message: "Added to bookmark" })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }

}
const removeBookMark = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
        const isBookMarkAvailable = await BookMark.findById(id)
        if (isBookMarkAvailable) {
            const deleteBookMark = await BookMark.findByIdAndDelete(isBookMarkAvailable)
            if (deleteBookMark) {
                return res.status(201).json({ message: "Removed from bookmark" })
            }
            else {
                return res.status(401).json({ message: "Something went wrong" })
            }
        }
        else {
            return res.status(401).json({ message: "Post is not available" })
        }

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getAllBookMarks, addToBookMark, removeBookMark };