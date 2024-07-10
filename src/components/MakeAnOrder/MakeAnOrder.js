import React, { useEffect, useState } from 'react';
import './makeAnOrder.css';
import axios from 'axios';

import Select from 'react-select'
import ListPosts from "./ListPosts/ListPosts";
import NumberInput from "../NumberInput";

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
]

const makeAnOrder = () => {
    const [serviceOptions, setServiceOptions] = useState([]);
    const [username, setUsername] = useState('');
    const [clientFetched, setClientFetched] = useState(false);
    const [posts, setPosts] = useState([]);

    useEffect(() => {axios.get(`http://localhost:3000/api/services`)
        .then(res => {
            const services = res.data;
            const options = services.map(service => ({ value: service.id, label: service.description }));
            setServiceOptions(options);
        })}, []);

    const handleUsernameOnchange = (e) => {
        setUsername(e.target.value);
    }

    const handleBrowsePosts = () => {
        axios.get(`http://localhost:3000/api/clients?username=${username}`)
            .then(res => {
                const photos = res.data.user.photos;
                const posts = photos.map(photo => ({ id: photo.id, preview: photo.image_preview }));
                setPosts(posts);
                setClientFetched(true);
            })
    }

    return (
        <>
            {/*<NumberInput />*/}
            {clientFetched && <ListPosts modalOpen={clientFetched} posts={posts}/>}
            <div className="panel place-order-panel">
                <div className="panel-heading">
                    <div className="header">
                        place an order
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="form-group">
                            <Select options={serviceOptions} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-7">
                        <div className="form-group">
                            <div className="ui icon input loading">
                                <div id="ember633" className="ember-view">
                                    <input id="ember634" placeholder="Enter your username" type="text"
                                           className="form-control ember-view ember-text-field" onChange={handleUsernameOnchange} />

                                    </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-5">
                        <div className="form-group">
                            <div id="ember635" className="ember-view">
                                <button onClick={handleBrowsePosts} className="btn btn-full" type="submit" data-ember-action="636">Browse posts</button>

                                </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="form-group">
                            <div id="ember637" className="ember-view">
                                <input id="ember638" disabled="" placeholder="amount" type="text"
                                       className="form-control ember-view ember-text-field" />

                                </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-4">
                        <div className="page-no">
                            starting from
                            <spna className="currancy">1$</spna>
                        </div>
                    </div>
                    <div className="col-xs-6 pull-right">
                        <button className="btn btn-full" type="submit" data-ember-action="639">checkout</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default makeAnOrder;
