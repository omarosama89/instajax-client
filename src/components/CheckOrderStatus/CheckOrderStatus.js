import React from 'react';

const CheckOrderStatus = () => {
    return (
        <section className="status-section" id="section3">
            <div className="content">
                {/*<div className="section-bg"></div>*/}
                {/*<div className="section-bg right"></div>*/}
                <div className="header  text-center">
                    <h2>Check Order Status</h2>
                    <p>Track your current order in our automated delivery system!</p>
                </div>
                <div className="row">
                    <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
                        <div className="row">
                            <div className="col-md-10 col-md-offset-1">
                                <div className="form-group">
                                    <div id="ember658" className="ember-view">


                                        </div>
                                    <input id="ember659" placeholder="ord-xxxxxxx" type="text"
                                           className="form-control ember-view ember-text-field" />
                                </div>
                            </div>
                            <div className="col-md-4 col-md-offset-7 col-sm-6 col-sm-offset-6">
                                <button id="orderStatusBtn" className="btn btn-full" data-ember-action="660">Check Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CheckOrderStatus;
