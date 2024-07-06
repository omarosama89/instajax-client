import ReactDOM from 'react-dom';
import React from 'react';
import PersonList from './components/PersonList.js';


const App = () => {
    return <PersonList/>;
}
ReactDOM.render(<App />, document.getElementById('app'));
