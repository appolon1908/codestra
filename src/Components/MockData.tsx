import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import prof1 from '../assets/picture-1.png'
import prof2 from '../assets/picture-2.png'
import prof3 from '../assets/picture-3.png'
import prof4 from '../assets/picture-4.png'

export const teamData = [
    {
        image: prof1,
        name: "Kevin Hard",
        position: "Project Manager",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
        ]
    },

    {
        image: prof2,
        name: "James Diamond",
        position: "Marketing",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },


    {
        image: prof3,
        name: "Andrew Tate",
        position: "Engineering",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },


    {
        image: prof4,
        name: "Sam Smith",
        position: "Product Design",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaTwitter />, url: "https://www.twitter.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },


    {
        image: prof2,
        name: "Tony Robins",
        position: "Sales",
        contact: "+234 5066 778987",
        socials: [
            { icon: <FaFacebook />, url: "https://www.facebook.com/johndoe" },
            { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/johndoe" },
        ]
    },

]


export const investorData = [
    {
        name: "John Doe",
        position: "Investor",
    },

    {
        name: "Jane Smith",
        position: "CEO, Twitter",
    },

    {
        name: "Mike Johnson",
        position: "AfterPay CEO",
    },

    {
        name: "Sarah Williams",
        position: "CEO, Stripe",
    },

    {
        name: "David Brown",
        position: "CEO, Retool",
    },

    {
        name: "Tom Hardy",
        position: "Partner, Y Combinator",
    },  
]