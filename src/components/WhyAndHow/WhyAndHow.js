import React from 'react';
import { Link } from 'react-router-dom';

const WhyAndHow = () => {
    return (
        <>
        <div className="container">
            <section className="actions">
                <div className="action-buttons">
                    <Link to="/make-an-order">
                        <button className="button make-order">Make an Order</button>
                    </Link>
                    <Link to="/check-order-status">
                        <button className="button check-order">Check Order Status</button>
                    </Link>
                </div>
            </section>
        </div>
        <div className="container">
            <section className="why-instajax">
                <h2>Why Instajax</h2>
                <div className="features">
                    <div className="feature">
                        <img src="./images/car.png" alt="Speed Icon" />
                            <h3>Speed</h3>
                            <p>High Speed Delivery. Our delivery system is fully automated. Get your order within
                                minutes after checking out!</p>
                    </div>
                    <div className="feature">
                        <img src="images/wrench.png" alt="Support Icon" />
                            <h3>Support</h3>
                            <p>Our customer support team is online 24/7 ready for help. Just text us on messenger or by
                                email.</p>
                    </div>
                    <div className="feature">
                        <img src="images/investments.png" alt="Privacy Icon" />
                            <h3>Privacy</h3>
                            <p>All followers and likes are reliable. We care about privacy and our clients are
                                top-secret!</p>
                    </div>
                </div>
            </section>
            <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="steps">
                    <div className="step">
                        <img src="images/document.png" alt="Order Form Icon" />
                            <h3>Fill Order Form</h3>
                            <p>Choose the service you want, fill your Instagram username, browse posts and checkout!</p>
                    </div>
                    <div className="step">
                        <img src="images/card.png" alt="PayPal Icon" />
                            <h3>Secure payment</h3>
                            <p>Pay online securely with your card</p>
                    </div>
                    <div className="step">
                        <img src="images/analysis.png" alt="Track Order Status Icon" />
                            <h3>Track Order Status</h3>
                            <p>You can track your order status via the code generated after placing the order from order
                                status form.</p>
                    </div>
                    <div className="step">
                        <img src="images/certificate.png" alt="Magic Happens Icon" />
                            <h3>Magic Happens</h3>
                            <p>Congratulations! Your social media presence is now promoted.</p>
                    </div>
                </div>
            </section>
        </div>
        </>
    )
}

export default WhyAndHow;
