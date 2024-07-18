import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from "axios";
import { Link } from 'react-router-dom';
import PostElement from "../ListPosts/PostElement/PostElement";

const CheckoutModal = ({selectedPhotos, modalOpen, gotoBrowsePostsModal}) => {
    return (
        <Modal isOpen={modalOpen}>

            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={gotoBrowsePostsModal}>×</button>
                    <h4 className="modal-title">select target posts</h4>
                    <h5>(Instagram likes)</h5>
                </div>
                <div className="modal-body">
                    {selectedPhotos.map((post) => <PostElement post={post} />)}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" >Pay</button>
                </div>
            </div>
        </Modal>
    )
}

export default CheckoutModal;
