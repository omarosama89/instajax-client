export const updateElement = (key, id, attr) => {
    const selectedPosts = JSON.parse(localStorage.getItem(key))
    const idx = selectedPosts.map(post => post.id).indexOf(id);
    if(idx > -1) {
        const post = selectedPosts.splice(idx, 1)[0];
        const updatedPost = { ...post, ...attr };
        const newSelectedPhotos = [...selectedPosts, updatedPost];
        localStorage.setItem(key, JSON.stringify(newSelectedPhotos));
    }
}

export const getElement = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

export const AddElement = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

export const removeElement = (key, id) => {
    const selectedPosts = JSON.parse(localStorage.getItem(key))
    const idx = selectedPosts.map(post => post.id).indexOf(id);
    if(idx > -1) {
        selectedPosts.splice(idx, 1);
        localStorage.setItem(key, JSON.stringify(selectedPosts));
    }
}
