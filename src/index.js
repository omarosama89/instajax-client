import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './instajax.css';

import Header from './components/Header/Header';
import WhyAndHow from "./components/WhyAndHow/WhyAndHow";
import MakeAnOrder from "./components/MakeAnOrder/MakeAnOrder";
import CheckOrderStatus from "./components/CheckOrderStatus/CheckOrderStatus";

const App = () => {
    return (
        <>
            <Router>
                <Header />
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
