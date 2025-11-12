/**
 * User Authentication and Personalization Script
 * Handles user authentication via API and personalized greeting display
 */

const API_BASE_URL = 'http://localhost:7366';

$(document).ready(function() {
    // Add hover effect to gift option cards
    $('.gift-option').hover(
        function() {
            $(this).css({
                'transform': 'translateY(-2px)',
                'box-shadow': '0 5px 15px rgba(0, 0, 0, 0.1)'
            });
        },
        function() {
            $(this).css({
                'transform': 'translateY(0)',
                'box-shadow': 'none'
            });
        }
    );

    // Add hover effect to gift button
    $('[data-target="#giftModal"]').hover(
        function() {
            $(this).css({
                'background': 'linear-gradient(135deg, #c4956a 0%, #b4855a 100%)',
                'transform': 'translateY(-2px)',
                'box-shadow': '0 6px 20px rgba(212, 165, 116, 0.4)'
            });
        },
        function() {
            $(this).css({
                'background': 'linear-gradient(135deg, #d4a574 0%, #c4956a 100%)',
                'transform': 'translateY(0)',
                'box-shadow': '0 4px 15px rgba(212, 165, 116, 0.3)'
            });
        }
    );

    // Handle modal events
    $('#giftModal').on('show.bs.modal', function () {
        console.log('Gift modal is about to be shown');
    });

    $('#giftModal').on('shown.bs.modal', function () {
        console.log('Gift modal is fully shown');
    });

    $('#giftModal').on('hide.bs.modal', function () {
        console.log('Gift modal is about to be hidden');
    });

    $('#giftModal').on('hidden.bs.modal', function () {
        console.log('Gift modal is fully hidden');
    });

    // User Authentication and Personalization Functions
    const WeddingAuth = {
        /**
         * Get username from URL query parameters
         * @returns {string|null} Username from URL or null if not found
         */
        getUsernameFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('username');
        },

        /**
         * Authenticate user via API
         * @param {string} username - Username to authenticate
         * @returns {Promise<Object|null>} API response data or null on error
         */
        async authenticateUser(username) {
            try {
                const response = await fetch(`${API_BASE_URL}/user/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: 'fosan_123'
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Authentication failed:', error);
                return null;
            }
        },

        /**
         * Update greeting element with user's full name
         * @param {string} fullName - User's full name to display
         */
        updateGreeting(fullName) {
            const greetingElement = document.querySelector('.cover-greeting');
            if (greetingElement) {
                greetingElement.innerHTML = `Kepada Yth. Bapak/Ibu/Saudara/i<br>${fullName}`;
            }

            // find input name="name"
            const nameInput = document.querySelector('input[name="name"]');
            if (nameInput) {
                nameInput.value = fullName;
                // set input to readonly
                nameInput.setAttribute('readonly', 'readonly');
            }
        },

        /**
         * Show loading state while fetching user data
         */
        showLoadingState() {
            const greetingElement = document.querySelector('.cover-greeting');
            if (greetingElement) {
                greetingElement.innerHTML = `Kepada Yth. Bapak/Ibu/Saudara/i<br><span style="opacity: 0.7;">Memuat data...</span>`;
            }
        },

        /**
         * Show error state or default greeting
         */
        showErrorState() {
            
            console.error('===> auth.js:127 ~ error');
            const greetingElement = document.querySelector('.cover-greeting');
            if (greetingElement) {
                greetingElement.innerHTML = `Kepada Yth. Bapak/Ibu/Saudara/i<br><span style="opacity: 0.7;">Tamu Undangan</span>`;
            }
        },

        /**
         * Initialize authentication process
         */
        async initializeUserAuth() {
            const username = this.getUsernameFromURL();

            if (username) {
                this.showLoadingState();

                try {
                    const authResult = await this.authenticateUser(username);
                    console.log('===> auth.js:143 ~ authResult', authResult);

                    const data = authResult.data?.length ? authResult.data[0] : null;

                    if (data) {
                        console.log('===> auth.js:151 ~ data.full_name', data.nama_user);
                        this.updateGreeting(data.nama_user);
                        console.log('User authenticated successfully:', data);
                    } else {
                        console.warn('Invalid response format or missing nama_user');
                        this.showErrorState();
                    }
                } catch (error) {
                    this.showErrorState();
                    console.error('Error during authentication:', error);
                }
            } else {
                // No username provided, show default greeting
                this.showErrorState();
            }
        },

        /**
         * Initialize all wedding page functionality
         */
        init() {
            this.initializeUserAuth();
        }
    };

    // Initialize authentication when page loads
    WeddingAuth.init();
});