import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
      },
      description: {
        type: String,
        // required: true,
      },
      price: {
        type: Number,
        // required: true,
      },
      // category: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: 'Category',
      //   required: true,
      // },
      stock: {
        type: Number,
        default: 0,
      },
      images:{
        type:String
      },
      //  [
      //   {
      //     url: { type: String,  },
      //     alt: { type: String },
      //   },
      // ],
      ratings: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          rating: { type: Number, min: 1, max: 5 },
          comment: { type: String },
        },
      ],
      averageRating: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      autorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

export default mongoose.model("Post", postSchema);