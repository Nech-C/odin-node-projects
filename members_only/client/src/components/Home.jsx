import "../styles/Home.css";
import PropTypes from "prop-types";
import { userEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Home(props) {
    return (
        <div>
            <h1>Exclusive Club</h1>
            <button className="login">LOG IN</button>
            <button className="register">REGISTER</button>
        </div>
    )
}

Home.propTypes = {

}

Home.defaultProps = {

}

export default Home;