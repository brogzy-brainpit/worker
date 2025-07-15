const mongoose= require("mongoose");
const apiKeys= require("../API");

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    group: {type:Array},
    age: {type:Number},
    status:{type:String,default:"active"},
    signUpSource:{type:String},
    emailOpens:{type:Number,default:0},
    emailSent:{type:Number,default:0},
    emailClicks:{type:Number,default:0},
    openRate:{type:Number,default:0},
    clickRate:{type:Number,default:0},
    // createdAt: { type: Date, default:"2024-07-18T00:00:00.000Z" }, // Timestamp for each subscriber
    createdAt: { type: Date, default: Date.now }, // Timestamp for each subscriber
});
const authSchema= new mongoose.Schema({
    userName:String,
    emailSent:{
        type:Number,
        default:0
    },
    avatar:{
        type:String,
        default:"https://www.svgrepo.com/show/382109/male-avatar-boy-face-man-user-7.svg"
       
    },
    firstName:{
        type:String,
        default:" "
       
    },
    verified:{
        type:Boolean,
        default:false
       
    },
    role:{
        type:String,
        default:" "
       
    },
    lastName:{
        type:String,
        default:" "
       
    },
   email:{
    type:String,
    unique:true,
    required:[true,"please provide an email"]
   },
   password:{
    type:String,
    required:[true,"please provide a password"]
},
createdAt: { type: Date, default: Date.now },
contacts:[contactSchema],
templates:{
    type:Array,
    default:[]
   
},
segments:{
    type:Array,
    default:[]
   
},
blogs:{
    type:Array,
    default:[]
   
},
fields:{
    type:Array,
    default:[]
   
},
groups:{
    type:Array,
    default:[]
   
},
apiKeys:{
    type:String,
    default:apiKeys() 
   
}
})
 
module.exports =mongoose.model("Users",authSchema)