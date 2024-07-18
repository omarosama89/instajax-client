import React, {useEffect, useRef, useState} from 'react';
import { updateElement } from '../../../../store/Posts';

const ListPosts = ({post, addPost, removePost, reloadPosts}) => {
    const mainRef = useRef(null);
    const [className, setClassName] = useState('post-content');
    const [amount, setAmount] = useState(null);

    const handleImageClick = () => {
        const checkbox = mainRef.current.querySelector(`input#${post.id}`)

        if(checkbox.checked) {
            setClassName('post-content')
            removePost(post);
        } else {
            checkbox.checked = true;
            setClassName(`${className} checked`);
            addPost(post);
        }
    }

    const handleCheckbox = (e) => {
        if(e.target.checked) {
            setClassName(`${className} checked`);
            addPost(post);
        } else {
            setClassName('post-content')
            removePost(post);
        }
        reloadPosts();
    }

    useEffect(() => {
        if(post.checked) {
            const checkbox = mainRef.current.querySelector(`input#${post.id}`)
            checkbox.checked = true;
            setClassName(`${className} checked`);
        }
        setAmount(post.amount);
    }, [post, amount]);

    const handleOnChangeAmount = (e) => {
        const amount = parseInt(e.target.value);
        updateElement('posts', post.id, { amount })
        reloadPosts();
    }

    return (
            <div className="col-md-3" ref={mainRef} >
                <div className="post-content-wrapper">
                    <div className={className} id={`div-${post.id}`}>
                        <img alt="post"
                             src={post.preview} onClick={handleImageClick}/>
                            <input id={post.id} type="checkbox"
                                   className="checkbox styled-checkbox" onClick={handleCheckbox}/>
                                <label htmlFor={post.id}></label>
                                <input pattern="[0-9]" type="number"
                                       className="form-control" value={amount} onChange={handleOnChangeAmount} />
                    </div>

                </div>
            </div>
    )
}

export default ListPosts;
