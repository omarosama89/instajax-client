import React from 'react';
import './makeAnOrder.css';

const makeAnOrder = () => {
    return (
        <div className="panel place-order-panel">
            <div className="panel-heading">
                <div className="header">
                    place an order
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                        <div id="ember565" className="ember-view">
                            <select id="sel1" tabIndex="0" className="form-control ember-view x-select">
                                <option id="ember584" className="ember-view x-option">select service</option>
                                <option id="ember586" value="1" className="ember-view x-option">Instagram likes</option>
                                <option id="ember588" value="2" className="ember-view x-option">Instagram Followers
                                </option>
                                <option id="ember590" value="3" className="ember-view x-option">Instagram video views
                                </option>
                                <option id="ember592" value="4" className="ember-view x-option">Instagram comments
                                </option>
                                <option id="ember594" value="5" className="ember-view x-option">Instagram custom
                                    comments
                                </option>
                                <option id="ember596" value="6" className="ember-view x-option">Facebook Followers
                                </option>
                                <option id="ember598" value="7" className="ember-view x-option">Facebook Video Views and
                                    Livestream
                                </option>
                                <option id="ember600" value="8" className="ember-view x-option">Facebook Profile/Pages
                                    Post Likes
                                </option>
                                <option id="ember602" value="9" className="ember-view x-option">Facebook Profile/Pages
                                    Post (Love)
                                </option>
                                <option id="ember604" value="10" className="ember-view x-option">Facebook Profile/Page
                                    Post (Haha)
                                </option>
                                <option id="ember606" value="11" className="ember-view x-option">Facebook Profile/Page
                                    Post (Wow)
                                </option>
                                <option id="ember608" value="12" className="ember-view x-option">Facebook Profile/Page
                                    Post (Sad)
                                </option>
                                <option id="ember610" value="13" className="ember-view x-option">Facebook Profile/Page
                                    Post (Angry)
                                </option>
                                <option id="ember612" value="14" className="ember-view x-option">Facebook Event Join
                                </option>
                                <option id="ember614" value="15" className="ember-view x-option">Facebook - 5 Star Page
                                    Rating
                                </option>
                                <option id="ember616" value="16" className="ember-view x-option">Soundcloud - Likes
                                </option>
                                <option id="ember618" value="17" className="ember-view x-option">Soundcloud - Plays
                                </option>
                                <option id="ember620" value="18" className="ember-view x-option">Soundcloud - Reposts
                                </option>
                                <option id="ember622" value="19" className="ember-view x-option">Soundcloud -
                                    Followers
                                </option>
                                <option id="ember624" value="20" className="ember-view x-option">Twitter Retweets
                                </option>
                                <option id="ember626" value="21" className="ember-view x-option">Twitter Favorites
                                </option>
                                <option id="ember628" value="22" className="ember-view x-option">Twitter Followers
                                </option>
                                <option id="ember630" value="23" className="ember-view x-option">Facebook Event
                                    Interested
                                </option>
                                <option id="ember632" value="25" className="ember-view x-option">Facebook Page Likes
                                </option>

                            </select>

                            </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-7">
                    <div className="form-group">
                        <div className="ui icon input loading">
                            <div id="ember633" className="ember-view">
                                <input id="ember634" placeholder="Enter your username" type="text"
                                       className="form-control ember-view ember-text-field" />

                                </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-5">
                    <div className="form-group">
                        <div id="ember635" className="ember-view">
                            <button className="btn btn-full" type="submit" data-ember-action="636">Browse posts</button>

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
    );
};

export default makeAnOrder;
