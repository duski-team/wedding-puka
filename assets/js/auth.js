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
        // Pagination state
        pagination: {
            currentPage: 1,
            itemsPerPage: 3,
            totalItems: 0,
            totalPages: 0,
            comments: []
        },
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
                    // Handle specific HTTP errors
                    if (response.status === 404) {
                        console.log('User not found (404) - Invalid invitation');
                        return { invalid: true, message: 'User not found' };
                    } else if (response.status === 401) {
                        console.log('Unauthorized (401) - Invalid invitation');
                        return { invalid: true, message: 'Unauthorized' };
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Check if response indicates invalid invitation
                if (data && (data.invalid === true || data.status === 'error' || data.message === 'User not found')) {
                    console.log('API indicates invalid invitation');
                    return { invalid: true, message: data.message || 'Invalid invitation' };
                }

                return data;
            } catch (error) {
                console.error('Authentication failed:', error);
                // Don't return null immediately, check if it's a network error that might indicate invalid invitation
                if (error.message.includes('404') || error.message.includes('401')) {
                    return { invalid: true, message: 'Invalid invitation' };
                }
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
         * Show invalid invitation state
         */
        showInvalidInvitationState() {
            const greetingElement = document.querySelector('.cover-greeting');
            const openInvitationBtn = document.getElementById('openInvitation');
            const youreInvitedText = document.querySelector('.cover-subtitle');

            // Update "You're Invited" text
            if (youreInvitedText) {
                // youreInvitedText.textContent = 'Undangan Tidak Valid';
                youreInvitedText.style.display = 'none';
            }

            // Update greeting message
            if (greetingElement) {
                greetingElement.innerHTML = `
                    <span style="color: #ff6b6b; font-weight: 600;">
                        ⚠️ Undangan Tidak Valid
                    </span><br>
                    <span style="opacity: 0.7; font-size: 14px;">
                        Maaf, undangan ini tidak dapat digunakan
                    </span>
                `;
            }

            // Hide or disable the open invitation button
            if (openInvitationBtn) {
                openInvitationBtn.style.display = 'none';
                // Alternatively, disable the button instead of hiding it:
                // openInvitationBtn.disabled = true;
                // openInvitationBtn.style.opacity = '0.5';
                // openInvitationBtn.style.cursor = 'not-allowed';
                // openInvitationBtn.innerHTML = '<i class="fi flaticon-envelope"></i> Undangan Tidak Valid';
            }

            // Optional: Add a message below the button area
            const coverContent = document.querySelector('.cover-content');
            if (coverContent) {
                const invalidMessage = document.createElement('div');
                invalidMessage.className = 'invalid-invitation-message';
                invalidMessage.style.cssText = `
                    text-align: center;
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(255, 107, 107, 0.1);
                    border-radius: 10px;
                    border: 2px solid #ff6b6b;
                    color: #ff6b6b;
                    font-size: 14px;
                    line-height: 1.4;
                `;
                invalidMessage.innerHTML = `
                    <i class="ti-alert" style="font-size: 20px; margin-right: 8px;"></i>
                    Silakan hubungi pengantin untuk undangan yang valid
                `;

                // Remove existing message if any
                const existingMessage = coverContent.querySelector('.invalid-invitation-message');
                if (existingMessage) {
                    existingMessage.remove();
                }

                coverContent.appendChild(invalidMessage);
            }
        },

        /**
         * Show valid invitation state (reset to normal)
         */
        showValidInvitationState() {
            const openInvitationBtn = document.getElementById('openInvitation');
            const coverContent = document.querySelector('.cover-content');

            // Restore the open invitation button
            if (openInvitationBtn) {
                openInvitationBtn.style.display = 'block';
                openInvitationBtn.disabled = false;
                openInvitationBtn.style.opacity = '1';
                openInvitationBtn.style.cursor = 'pointer';
                openInvitationBtn.innerHTML = '<i class="fi flaticon-envelope"></i> Buka Undangan';
            }

            // Remove invalid message if exists
            const invalidMessage = coverContent.querySelector('.invalid-invitation-message');
            if (invalidMessage) {
                invalidMessage.remove();
            }
        },

        /**
         * Submit RSVP form to API
         * @param {Object} formData - Form data object
         * @returns {Promise<Object|null>} API response or null on error
         */
        async submitRSVP(formData) {
            try {
                const response = await fetch(`${API_BASE_URL}/komentar/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                return result;
            } catch (error) {
                console.error('RSVP submission failed:', error);
                return null;
            }
        },

        /**
         * Map attendance value from form to API format
         * @param {string} attendanceText - Text from attendance dropdown
         * @returns {number} 1 for attending, 2 for not attending
         */
        mapAttendanceValue(attendanceText) {
            if (attendanceText.toLowerCase().includes('datang')) {
                return 1;
            } else if (attendanceText.toLowerCase().includes('tidak')) {
                return 2;
            }
            return 1; // Default to attending if unclear
        },

        /**
         * Validate RSVP form
         * @param {Object} formData - Form data to validate
         * @returns {Object} Validation result with isValid and errors
         */
        validateRSVPForm(formData) {
            const errors = [];

            if (!formData.nama_komentator || formData.nama_komentator.trim() === '') {
                errors.push('Nama wajib diisi');
            }

            if (!formData.isi_komentar || formData.isi_komentar.trim() === '') {
                errors.push('Pesan wajib diisi');
            }

            if (!formData.kehadiran) {
                errors.push('Status kehadiran wajib dipilih');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * Show RSVP form success message
         */
        showRSVPSuccess() {
            const successDiv = document.getElementById('success');
            const errorDiv = document.getElementById('error');
            const form = document.getElementById('rsvp-form');

            if (successDiv) {
                successDiv.style.display = 'block';
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 5000);
            }

            if (errorDiv) {
                errorDiv.style.display = 'none';
            }

            if (form) {
                // form.reset();
                // reset form events & notes only
                const notesInput = form.querySelector('textarea[name="notes"]');
                const attendanceSelect = form.querySelector('select[name="events"]');
                if (notesInput) notesInput.value = '';
                if (attendanceSelect) attendanceSelect.selectedIndex = 0;
            }
        },

        /**
         * Show RSVP form error message
         * @param {string} message - Error message to display
         */
        showRSVPError(message = 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.') {
            const successDiv = document.getElementById('success');
            const errorDiv = document.getElementById('error');
            const loader = document.getElementById('loader');

            if (successDiv) {
                successDiv.style.display = 'none';
            }

            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 5000);
            }

            if (loader) {
                loader.style.display = 'none';
            }
        },

        /**
         * Fetch comment list from API with pagination
         * @param {number} page - Page number to fetch
         * @returns {Promise<Object|null>} API response with comment data or null on error
         */
        async fetchCommentList(page = 1) {
            try {
                const response = await fetch(`${API_BASE_URL}/komentar/list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        page: page,
                        limit: this.pagination.itemsPerPage
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('===> auth.js:285 ~ result', result);
                return result;
            } catch (error) {
                console.error('Failed to fetch comments:', error);
                return null;
            }
        },

        /**
         * Format date for display
         * @param {string} dateString - Date string from API
         * @returns {string} Formatted date string
         */
        formatDate(dateString) {
            try {
                const date = new Date(dateString);
                const options = {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                };
                return date.toLocaleDateString('id-ID', options);
            } catch (error) {
                return dateString;
            }
        },

        /**
         * Map attendance value to display text
         * @param {number} kehadiran - Attendance value from API (1 or 2)
         * @returns {string} Display text for attendance status
         */
        mapAttendanceToText(kehadiran) {
            return kehadiran === 1 ? 'Akan Datang' : 'Tidak Dapat Datang';
        },

        /**
         * Get attendance icon based on value
         * @param {number} kehadiran - Attendance value from API (1 or 2)
         * @returns {string} HTML for attendance icon
         */
        getAttendanceIcon(kehadiran) {
            return kehadiran === 1
                ? '<i class="ti-check" style="color: #28a745;"></i>'
                : '<i class="ti-close" style="color: #dc3545;"></i>';
        },

        /**
         * Get comments for current page
         * @returns {Array} Comments for current page
         */
        getCurrentPageComments() {
            const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
            const endIndex = startIndex + this.pagination.itemsPerPage;
            return this.pagination.comments.slice(startIndex, endIndex);
        },

        /**
         * Update pagination state
         * @param {Array} allComments - All comments from API
         */
        updatePaginationState(allComments) {
            this.pagination.comments = Array.isArray(allComments) ? allComments : [];
            this.pagination.totalItems = this.pagination.comments.length;
            this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
            this.pagination.currentPage = Math.min(this.pagination.currentPage, Math.max(1, this.pagination.totalPages));
        },

        /**
         * Render pagination controls
         */
        renderPaginationControls() {
            const paginationContainer = document.getElementById('pagination-controls');
            if (!paginationContainer) return;

            if (this.pagination.totalPages <= 1) {
                paginationContainer.innerHTML = '';
                return;
            }

            let paginationHTML = '<div class="pagination-wrapper text-center">';

            // Previous button
            paginationHTML += `
                <button onclick="WeddingAuth.goToPage(${this.pagination.currentPage - 1})"
                        class="btn-pagination btn-prev"
                        ${this.pagination.currentPage === 1 ? 'disabled' : ''}
                        style="margin: 0 5px; padding: 8px 16px; border: 1px solid #d4a574; background: ${this.pagination.currentPage === 1 ? '#f8f9fa' : '#d4a574'}; color: ${this.pagination.currentPage === 1 ? '#666' : 'white'}; border-radius: 5px; cursor: ${this.pagination.currentPage === 1 ? 'not-allowed' : 'pointer'};">
                    <i class="ti-arrow-left"></i> Sebelumnya
                </button>
            `;

            // Page numbers
            const startPage = Math.max(1, this.pagination.currentPage - 2);
            const endPage = Math.min(this.pagination.totalPages, this.pagination.currentPage + 2);

            if (startPage > 1) {
                paginationHTML += `
                    <button onclick="WeddingAuth.goToPage(1)" class="btn-pagination" style="margin: 0 5px; padding: 8px 12px; border: 1px solid #d4a574; background: white; color: #d4a574; border-radius: 5px; cursor: pointer;">
                        1
                    </button>
                `;
                if (startPage > 2) {
                    paginationHTML += '<span style="margin: 0 5px;">...</span>';
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <button onclick="WeddingAuth.goToPage(${i})"
                            class="btn-pagination ${i === this.pagination.currentPage ? 'active' : ''}"
                            style="margin: 0 5px; padding: 8px 12px; border: 1px solid #d4a574; background: ${i === this.pagination.currentPage ? '#d4a574' : 'white'}; color: ${i === this.pagination.currentPage ? 'white' : '#d4a574'}; border-radius: 5px; cursor: pointer;">
                        ${i}
                    </button>
                `;
            }

            if (endPage < this.pagination.totalPages) {
                if (endPage < this.pagination.totalPages - 1) {
                    paginationHTML += '<span style="margin: 0 5px;">...</span>';
                }
                paginationHTML += `
                    <button onclick="WeddingAuth.goToPage(${this.pagination.totalPages})" class="btn-pagination" style="margin: 0 5px; padding: 8px 12px; border: 1px solid #d4a574; background: white; color: #d4a574; border-radius: 5px; cursor: pointer;">
                        ${this.pagination.totalPages}
                    </button>
                `;
            }

            // Next button
            paginationHTML += `
                <button onclick="WeddingAuth.goToPage(${this.pagination.currentPage + 1})"
                        class="btn-pagination btn-next"
                        ${this.pagination.currentPage === this.pagination.totalPages ? 'disabled' : ''}
                        style="margin: 0 5px; padding: 8px 16px; border: 1px solid #d4a574; background: ${this.pagination.currentPage === this.pagination.totalPages ? '#f8f9fa' : '#d4a574'}; color: ${this.pagination.currentPage === this.pagination.totalPages ? '#666' : 'white'}; border-radius: 5px; cursor: ${this.pagination.currentPage === this.pagination.totalPages ? 'not-allowed' : 'pointer'};">
                    Selanjutnya <i class="ti-arrow-right"></i>
                </button>
            `;

            paginationHTML += '</div>';

            // Add pagination info
            paginationHTML += `
                <div class="pagination-info text-center" style="margin-top: 15px; color: #666; font-size: 14px;">
                    Menampilkan ${((this.pagination.currentPage - 1) * this.pagination.itemsPerPage) + 1}-${Math.min(this.pagination.currentPage * this.pagination.itemsPerPage, this.pagination.totalItems)} dari ${this.pagination.totalItems} ucapan
                </div>
            `;

            paginationContainer.innerHTML = paginationHTML;
        },

        /**
         * Navigate to specific page
         * @param {number} page - Page number to navigate to
         */
        goToPage(page) {
            if (page < 1 || page > this.pagination.totalPages || page === this.pagination.currentPage) {
                return;
            }

            this.pagination.currentPage = page;
            this.renderCurrentPageComments();
            this.renderPaginationControls();

            // Scroll to top of comments section
            const commentsSection = document.getElementById('comments-section');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
            }
        },

        /**
         * Render comments for current page
         */
        renderCurrentPageComments() {
            const currentPageComments = this.getCurrentPageComments();
            const commentsContainer = document.getElementById('comments-list');
            const commentsCount = document.getElementById('comments-count');

            if (!commentsContainer) return;

            // Update comments count with total
            if (commentsCount) {
                commentsCount.textContent = this.pagination.totalItems;
            }

            if (currentPageComments.length === 0) {
                commentsContainer.innerHTML = `
                    <div class="text-center py-5">
                        <i class="ti-comments" style="font-size: 48px; color: #d4a574; margin-bottom: 15px;"></i>
                        <p style="color: #666;">Belum ada ucapan selamat</p>
                        <p style="color: #999; font-size: 14px;">Jadilah yang pertama memberikan ucapan!</p>
                    </div>
                `;
                this.renderPaginationControls();
                return;
            }

            const commentsHTML = currentPageComments.map(comment => `
                <div class="comment-item" style="background: #fff; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); border-left: 4px solid ${comment.kehadiran === 1 ? '#28a745' : '#dc3545'};">
                    <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <div style="flex: 1;">
                            <h5 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">
                                ${this.getAttendanceIcon(comment.kehadiran)} ${comment.nama_komentator}
                            </h5>
                            <small style="color: #666; font-size: 12px;">
                                ${this.formatDate(comment.created_at)}
                            </small>
                        </div>
                        <div style="text-align: right;">
                            <span class="badge" style="background: ${comment.kehadiran === 1 ? '#28a745' : '#dc3545'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                ${this.mapAttendanceToText(comment.kehadiran)}
                            </span>
                        </div>
                    </div>
                    <div class="comment-body">
                        <p style="margin: 0; color: #555; line-height: 1.6; font-size: 14px;">
                            ${comment.isi_komentar}
                        </p>
                    </div>
                </div>
            `).join('');

            commentsContainer.innerHTML = commentsHTML;
            this.renderPaginationControls();
        },

        /**
         * Render comment list to HTML
         * @param {Array} comments - Array of comment objects from API
         */
        renderComments(comments) {
            this.updatePaginationState(comments);
            this.renderCurrentPageComments();
        },

        /**
         * Show loading state for comments
         */
        showCommentsLoading() {
            const commentsContainer = document.getElementById('comments-list');
            if (commentsContainer) {
                commentsContainer.innerHTML = `
                    <div class="text-center py-5">
                        <div class="spinner-border" role="status" style="color: #d4a574;">
                            <span class="sr-only">Memuat...</span>
                        </div>
                        <p class="mt-3" style="color: #666;">Memuat ucapan selamat...</p>
                    </div>
                `;
            }
        },

        /**
         * Show error state for comments
         */
        showCommentsError() {
            const commentsContainer = document.getElementById('comments-list');
            if (commentsContainer) {
                commentsContainer.innerHTML = `
                    <div class="text-center py-5">
                        <i class="ti-alert" style="font-size: 48px; color: #dc3545; margin-bottom: 15px;"></i>
                        <p style="color: #666;">Gagal memuat ucapan selamat</p>
                        <button onclick="WeddingAuth.loadComments()" class="btn btn-sm" style="background: #d4a574; color: white; border: none; border-radius: 5px; padding: 8px 16px; font-size: 14px;">
                            Coba Lagi
                        </button>
                    </div>
                `;
            }
        },

        /**
         * Load and display comments
         */
        async loadComments() {
            this.showCommentsLoading();

            try {
                const response = await this.fetchCommentList();

                if (response && response.data) {
                    const comments = Array.isArray(response.data) ? response.data : [];
                    this.renderComments(comments);
                    console.log('Comments loaded successfully:', comments);
                } else {
                    this.renderComments([]); // Show empty state
                    console.warn('Invalid comments response format');
                }
            } catch (error) {
                this.showCommentsError();
                console.error('Error loading comments:', error);
            }
        },

        /**
         * Initialize comment section
         */
        initializeComments() {
            // Check if comments section exists
            const commentsSection = document.getElementById('comments-section');
            if (commentsSection) {
                this.loadComments();
            }
        },

        /**
         * Initialize RSVP form functionality
         */
        initializeRSVPForm() {
            const form = document.getElementById('rsvp-form');

            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    // Get form data
                    const nameInput = form.querySelector('input[name="name"]');
                    const notesInput = form.querySelector('textarea[name="notes"]');
                    const attendanceSelect = form.querySelector('select[name="events"]');
                    const loader = document.getElementById('loader');

                    // Show loader
                    if (loader) {
                        loader.style.display = 'block';
                    }

                    // Prepare form data for API
                    const formData = {
                        nama_komentator: nameInput ? nameInput.value : '',
                        isi_komentar: notesInput ? notesInput.value : '',
                        kehadiran: attendanceSelect ? this.mapAttendanceValue(attendanceSelect.value) : 1
                    };

                    // Validate form
                    const validation = this.validateRSVPForm(formData);

                    if (!validation.isValid) {
                        this.showRSVPError(validation.errors.join(', '));
                        return;
                    }

                    try {
                        // Submit to API
                        const result = await this.submitRSVP(formData);

                        if (result) {
                            this.showRSVPSuccess();
                            console.log('RSVP submitted successfully:', result);
                            // Refresh comments list after successful submission
                            this.loadComments();

                            // Scroll to element id "comments-section"
                            const commentsSection = document.getElementById('comments-section');
                            commentsSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            this.showRSVPError('Gagal mengirim RSVP. Silakan coba lagi.');
                        }
                    } catch (error) {
                        this.showRSVPError('Terjadi kesalahan jaringan. Silakan coba lagi.');
                        console.error('RSVP submission error:', error);
                    } finally {
                        // Hide loader
                        if (loader) {
                            loader.style.display = 'none';
                        }
                    }
                });
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

                    // Check if authentication result indicates invalid invitation
                    if (authResult && authResult.invalid === true) {
                        console.log('Invalid invitation detected:', authResult.message);
                        this.showInvalidInvitationState();
                        return;
                    }

                    // Check for valid user data
                    const data = authResult?.data?.length ? authResult.data[0] : null;

                    if (data && data.nama_user) {
                        console.log('===> auth.js:151 ~ data.nama_user', data.nama_user);
                        this.updateGreeting(data.nama_user);
                        this.showValidInvitationState(); // Ensure button is visible for valid users
                        console.log('User authenticated successfully:', data);
                    } else {
                        console.warn('Invalid response format or missing nama_user');
                        this.showErrorState();
                        // Also show invalid invitation state if no valid data found
                        this.showInvalidInvitationState();
                    }
                } catch (error) {
                    console.error('Error during authentication:', error);
                    // Check if error indicates invalid invitation
                    if (error.message && (error.message.includes('404') || error.message.includes('401'))) {
                        this.showInvalidInvitationState();
                    } else {
                        this.showErrorState();
                    }
                }
            } else {
                // No username provided, show default greeting (not invalid invitation)
                this.showErrorState();
            }
        },

        /**
         * Initialize all wedding page functionality
         */
        init() {
            this.initializeUserAuth();
            this.initializeRSVPForm();
            this.initializeComments();
        }
    };

    // Initialize authentication when page loads
    WeddingAuth.init();

    // Make WeddingAuth accessible globally for onclick handlers
    window.WeddingAuth = WeddingAuth;
});