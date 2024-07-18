import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';

import PostElement from "./PostElement/PostElement";
import { getElement } from "../../../store/Posts";

const ListPosts = ({
                       modalOpen,
                       addPost, removePost, setClientFetched,
                       setCheckoutModalIsOpen,
                       gotoBrowsePostsModal, reloadPosts
}) => {
    const [posts, setPosts] = useState([]);
    const mainRef = useRef(null);
    const handleCheckout = () => {
        setClientFetched(false);
        setCheckoutModalIsOpen(true);
    }

    const handleModalDismiss = () => {
        setClientFetched(false);
    }
    // const [selectedPhotos, setSelectedPhotos] = useState([])

    useEffect(() => {
        const selectedPosts = getElement('posts').filter(post => post.checked);
        // setSelectedPhotos(selectedPosts);
        selectedPosts.forEach(post => {
            let checkbox = null;
            if(mainRef.current) {
                checkbox = mainRef.current.querySelector(`input#${post.id}`);
                checkbox.checked = true;
                const postContent = mainRef.current.querySelector(`div#div-${post.id}`);
                postContent.className = `${postContent.className} checked`
            }
        });
    }, [posts]);

    useEffect(() => {
        reloadPosts();
    }, []);

    useEffect(() => {
        const selectedPosts = getElement('posts').filter(post => post.checked);
        setSelectedPhotos(selectedPosts);
    }, []);

    return (
        <Modal isOpen={modalOpen} >
            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={handleModalDismiss}>×</button>
                    <h4 className="modal-title">select target posts</h4>
                    <h5>(Instagram likes)</h5>
                </div>
                <div className="modal-body" ref={mainRef}>
                    {posts.map((post) => <PostElement post={post} addPost={addPost} removePost={removePost} reloadPosts={reloadPosts}/>)}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" onClick={handleCheckout}>Checkout</button>
                    <button type="button" className="link editorderLink">Add Links Manually
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ListPosts;
