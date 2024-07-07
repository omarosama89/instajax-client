import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Header from './components/Header/Header';
import WhyAndHow from "./components/WhyAndHow/WhyAndHow";
import './index.css';
import MakeAnOrder from "./components/MakeAnOrder/MakeAnOrder";
import CheckOrderStatus from "./components/CheckOrderStatus/CheckOrderStatus";

const App = () => {
    return (
        <>
            <Header />
            <Router>
                <Routes>
                    <Route path="/make-an-order" element={<MakeAnOrder />} />
                    <Route path="/check-order-status" element={<CheckOrderStatus />} />
                    <Route path="*" element={<WhyAndHow />} component={WhyAndHow} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
ReactDOM.render(<App />, document.getElementById('app'));
