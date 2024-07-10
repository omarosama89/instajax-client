import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import axios from "axios";
import { Link } from 'react-router-dom';
import PostElement from "./PostElement/PostElement";

const ListPosts = ({posts, modalOpen}) => {
    const [modalIsOpen, setModalIsOpen] = useState(modalOpen);

    return (
        <Modal isOpen={modalIsOpen}>

            <div className="modal-content">
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal">×</button>
                    <h4 className="modal-title">select target posts</h4>
                    <h5>(Instagram likes)</h5>
                </div>
                <div className="modal-body">
                    {posts.map((post) => <PostElement image={post}/>)}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn" data-ember-action="546">Checkout</button>
                    <button type="button" className="link editorderLink" data-ember-action="547">Add Links Manually
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ListPosts;
