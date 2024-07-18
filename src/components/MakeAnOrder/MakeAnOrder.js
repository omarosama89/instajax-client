import React, { useEffect, useState, useRef } from 'react';
import './MakeAnOrder.css';
import axios from 'axios';

import Select from 'react-select'
import ListPosts from "./ListPosts/ListPosts";
import CheckoutModal from "./CheckoutModal/CheckoutModal";
import { updateElement, removeElement, getElement, AddElement } from "../../store/Posts";
import {setElement} from "react-modal/lib/helpers/ariaAppHider";

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
]

const MakeAnOrder = ({}) => {
    const mainRef = useRef(null);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [username, setUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [clientFetched, setClientFetched] = useState(false);
    const [posts, setPosts] = useState([]);
    const [service, setService] = useState('');
    const [checkoutModalIsOpen, setCheckoutModalIsOpen] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:3000/api/services`)
            .then(res => {
                const services = res.data;
                const options = services.map(service => ({ value: service.id, label: service.description }));
                setServiceOptions(options);
            });
        // AddElement('posts', []);
    }, []);

    const handleUsernameOnchange = (e) => {
        setUsername(e.target.value);
    }

    const clearPosts = () => {
        const posts = getElement('posts');
        posts.forEach()
    }

    const handleBrowsePosts = () => {
        uncheckAllPosts();
        axios.get(`http://localhost:3000/api/clients?username=${username}`)
            .then(res => {
                const photos = res.data.user.photos;
                const posts = photos.map(photo => ({ id: photo.id, preview: photo.image_preview }));
                setPosts(posts);
                gotoBrowsePostsModal();
                // setClientFetched(true);
                const indexedPosts = posts.map((post, index) => ({...post, index}));
                AddElement('posts', indexedPosts);
            })
    }

    const handleServiceOnchange = (e) => {
        setService(e.value);
    }

    const handleAmountOnchange = (e) => {
        setAmount(e.target.value);
    }

    const addPost = (post) => {
        setSelectedPosts([...selectedPosts, post]);
        // AddElement('selectedPosts', [...selectedPosts, post]);
        updateElement('posts', post.id, { checked: true });
    }

    const removePost = (post) => {
        const idx = selectedPosts.map( post => post.id).indexOf(post.id);
        if(idx > -1) {
            selectedPosts.splice(idx, 1);
            setSelectedPosts(selectedPosts);

            // AddElement('selectedPosts', selectedPosts);
            updateElement('posts', post.id, { checked: false });
        }
    }

    const gotoBrowsePostsModal = () => {
        setClientFetched(true);
        setCheckoutModalIsOpen(false);
        // const checkboxes = mainRef.current.querySelectorAll('input[type="checkbox"]');
    }

    const uncheckAllPosts = () => {
        const posts = getElement('posts');
        posts.forEach(post => {
            post.checked = false;
            post.amount = null;
        });
        AddElement('posts', posts);
    }

    const reloadPosts = () => {
        const posts = getElement('posts').sort((a, b) => a.index - b.index);
        setPosts(posts);
    }

    return (
        <div ref={mainRef}>
            {clientFetched && <ListPosts
                modalOpen={clientFetched}
                posts={posts}
                addPost={addPost}
                removePost={removePost}
                setClientFetched={setClientFetched}
                setCheckoutModalIsOpen={setCheckoutModalIsOpen}
                selectedPosts={selectedPosts}
                mainRef={mainRef}
                gotoBrowsePostsModal={gotoBrowsePostsModal}
                reloadPosts={reloadPosts}
            />}
            {checkoutModalIsOpen && <CheckoutModal
                selectedPhotos={selectedPosts}
                modalOpen={checkoutModalIsOpen}
                setClientFetched={setClientFetched}
                setCheckoutModalIsOpen={setCheckoutModalIsOpen}
                gotoBrowsePostsModal={gotoBrowsePostsModal}
                reloadPosts={reloadPosts}
            />}
            <div className="panel place-order-panel">
                <div className="panel-heading">
                    <div className="header">
                        place an order
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="form-group">
                            <Select options={serviceOptions} onChange={handleServiceOnchange} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-7">
                        <div className="form-group">
                            <div className="ui icon input loading">
                                <input id="ember634" placeholder="Enter your username" type="text"
                                       className="form-control ember-view ember-text-field" onChange={handleUsernameOnchange} />
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
                                       className="form-control ember-view ember-text-field" onChange={handleAmountOnchange} />

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
        </div>
    );
};

export default MakeAnOrder;
