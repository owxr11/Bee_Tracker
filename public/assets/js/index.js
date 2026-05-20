import { getCurrentUser } from './auth.js';


getCurrentUser((user) => {
    if(user){
        window.location.href = 'dashboard.html';

    }else{
        window.location.href = 'login.html';
    }
    
});