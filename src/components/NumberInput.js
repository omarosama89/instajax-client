import React from 'react';

const NumberInput = ({}) => {

    return (
        <div className="image-container">
            <img src="/images/post1.jpg" alt="Background" className="background-image" />
            <div className="input-container">
                <input type="number" className="number-input" />
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" />
                    Check me
                </label>
            </div>
        </div>
    )
}

export default NumberInput;
