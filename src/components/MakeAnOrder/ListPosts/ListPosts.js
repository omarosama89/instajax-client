import React, { useEffect, useState } from 'react';
import { REACT_APP_BACKEND_HOST } from '../../../config/EnvVariables';
import { Link } from 'react-router-dom';
import axios from "axios";

const Header = () => {
    useEffect(() => {axios.get(`${REACT_APP_BACKEND_HOST}/api/services`)
        .then(res => {
            const services = res.data.services;
            const options = services.map(service => ({ value: service.id, label: service.description }));
            setServiceOptions(options);
        })}, []);
    return (
        <header>
            <div className="features">
                <div className="features">
                    <Link to="/">
                        <img src="./images/logo.png" alt="Instajax Logo" className="logo" />
                    </Link>
                </div>
                <div className="features">
                </div>
                <div className="features">
                </div>
                <div className="features">
                </div>
            </div>
        </header>
    )
}

export default Header;
