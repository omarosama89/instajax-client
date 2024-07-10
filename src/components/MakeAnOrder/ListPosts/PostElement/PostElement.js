import React from 'react';

const ListPosts = ({image}) => {

    return (
            <div className="col-md-3">
                <div className="post-content-wrapper">
                    <div className="post-content" id="div-C9Kt-Yepnft">
                        <img alt="post"
                             src={image.preview} />
                            <input id={image.id} type="checkbox"
                                   className="checkbox styled-checkbox" />
                                <label htmlFor="C9Kt-Yepnft"></label>
                                <input pattern="[0-9]" type="number"
                                       className="form-control" />
                    </div>

                    </div>
            </div>
    )
}

export default ListPosts;
