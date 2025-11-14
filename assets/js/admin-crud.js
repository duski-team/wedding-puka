/**
 * User Management CRUD System
 * Handles admin user operations with password protection
 */

const API_BASE_URL = 'https://serova.id/api-wedding';
const ADMIN_PASSWORD = 'bagas_ganteng'; // Static password for admin access

$(document).ready(function() {
    // User Management CRUD Functions
    const UserCRUD = {
        /**
         * Check if current user has admin privileges for CRUD operations
         * @returns {boolean} True if user can perform CRUD operations
         */
        hasAdminAccess() {
            // Check if admin session exists
            const adminSession = sessionStorage.getItem('adminAuthenticated');
            return adminSession === 'true';
        },

        /**
         * Get static password for user operations
         * @returns {string} Static password for CRUD operations
         */
        getStaticPassword() {
            return 'bagas_ganteng_bingitzzzzzzz';
        },

        /**
         * Get static role for user operations
         * @returns {null} Static role for CRUD operations
         */
        getStaticRole() {
            return null;
        },

        /**
         * Show password prompt and validate
         * @returns {Promise<boolean>} True if password is correct
         */
        async promptAdminPassword() {
            return new Promise((resolve) => {
                // Create modal overlay
                const modal = document.createElement('div');
                modal.id = 'admin-password-modal';
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                `;

                // Create modal content
                const modalContent = document.createElement('div');
                modalContent.style.cssText = `
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                `;

                modalContent.innerHTML = `
                    <h3 style="margin-bottom: 20px; color: #d4a574;">Admin Access Required</h3>
                    <p style="margin-bottom: 30px; color: #666; line-height: 1.5;">
                        Masukkan password admin untuk melanjutkan ke halaman manajemen user
                    </p>
                    <input type="password" id="admin-password-input"
                           placeholder="Masukkan password"
                           style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; font-size: 16px; box-sizing: border-box;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="admin-password-cancel" style="padding: 10px 20px; border: 1px solid #dc3545; background: white; color: #dc3545; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            Batal
                        </button>
                        <button id="admin-password-submit" style="padding: 10px 20px; background: #d4a574; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            Masuk
                        </button>
                    </div>
                    <div id="password-error" style="color: #dc3545; margin-top: 15px; font-size: 14px; display: none;">
                        Password salah. Silakan coba lagi.
                    </div>
                `;

                modal.appendChild(modalContent);
                document.body.appendChild(modal);

                // Focus on password input
                document.getElementById('admin-password-input').focus();

                // Handle submit
                document.getElementById('admin-password-submit').addEventListener('click', () => {
                    const passwordInput = document.getElementById('admin-password-input');
                    const password = passwordInput.value.trim();

                    if (password === ADMIN_PASSWORD) {
                        sessionStorage.setItem('adminAuthenticated', 'true');
                        modal.remove();
                        resolve(true);
                    } else {
                        document.getElementById('password-error').style.display = 'block';
                        passwordInput.value = '';
                        passwordInput.focus();
                    }
                });

                // Handle cancel
                document.getElementById('admin-password-cancel').addEventListener('click', () => {
                    modal.remove();
                    resolve(false);
                });

                // Handle Enter key
                document.getElementById('admin-password-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        document.getElementById('admin-password-submit').click();
                    }
                });

                // Close modal when clicking outside
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        resolve(false);
                    }
                });
            });
        },

        /**
         * Logout admin session
         */
        logoutAdmin() {
            sessionStorage.removeItem('adminAuthenticated');
            this.showNotification('Logout', 'Admin session ended', 'error');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },

        /**
         * Fetch user list from API
         * @returns {Promise<Object|null>} API response with user list or null on error
         */
        async fetchUserList() {
            try {
                if (!this.hasAdminAccess()) {
                    const authenticated = await this.promptAdminPassword();
                    if (!authenticated) {
                        return { error: 'Access denied', message: 'Admin authentication required' };
                    }
                }

                const response = await fetch(`${API_BASE_URL}/user/list`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Users fetched successfully:', result);
                return result;
            } catch (error) {
                console.error('Failed to fetch users:', error);
                return null;
            }
        },

        /**
         * Register new user via API
         * @param {Object} userData - User data object
         * @returns {Promise<Object|null>} API response or null on error
         */
        async registerUser(userData) {
            try {
                if (!this.hasAdminAccess()) {
                    const authenticated = await this.promptAdminPassword();
                    if (!authenticated) {
                        return { error: 'Access denied', message: 'Admin authentication required' };
                    }
                }

                // Validate user data
                const validation = this.validateUserData(userData, 'register');
                if (!validation.isValid) {
                    return { error: 'Validation failed', errors: validation.errors };
                }

                // Prepare payload with static values
                const payload = {
                    username: userData.username,
                    password: this.getStaticPassword(),
                    role: this.getStaticRole(),
                    nama_user: userData?.nama_user || userData.username
                };

                const response = await fetch(`${API_BASE_URL}/user/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('User registered successfully:', result);
                this.showNotification('Registrasi', 'User berhasil didaftarkan', 'success');
                return result;
            } catch (error) {
                console.error('Failed to register user:', error);
                this.showNotification('Registrasi', 'Gagal mendaftarkan user', 'error');
                return null;
            }
        },

        /**
         * Update existing user via API
         * @param {Object} userData - User data object to update
         * @returns {Promise<Object|null>} API response or null on error
         */
        async updateUser(userData) {
            try {
                if (!this.hasAdminAccess()) {
                    const authenticated = await this.promptAdminPassword();
                    if (!authenticated) {
                        return { error: 'Access denied', message: 'Admin authentication required' };
                    }
                }

                if (!userData.username) {
                    throw new Error('Username is required for update operation');
                }

                // Validate user data
                const validation = this.validateUserData(userData, 'update');
                if (!validation.isValid) {
                    return { error: 'Validation failed', errors: validation.errors };
                }

                // Prepare payload with static values
                const payload = {
                    username: userData.username,
                    password: userData.password || this.getStaticPassword(),
                    role: userData.role !== undefined ? userData.role : this.getStaticRole(),
                    nama_user: userData.nama_user || userData.username
                };

                const response = await fetch(`${API_BASE_URL}/user/update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('User updated successfully:', result);
                this.showNotification('Update', 'User berhasil diperbarui', 'success');
                return result;
            } catch (error) {
                console.error('Failed to update user:', error);
                this.showNotification('Update', 'Gagal memperbarui user', 'error');
                return null;
            }
        },

        /**
         * Delete user via API
         * @param {string} username - Username of user to delete
         * @returns {Promise<Object|null>} API response or null on error
         */
        async deleteUser(username) {
            try {
                if (!this.hasAdminAccess()) {
                    const authenticated = await this.promptAdminPassword();
                    if (!authenticated) {
                        return { error: 'Access denied', message: 'Admin authentication required' };
                    }
                }

                if (!username) {
                    throw new Error('Username is required for delete operation');
                }

                // Confirm deletion
                const confirmed = confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`);
                if (!confirmed) {
                    return { cancelled: true };
                }

                const response = await fetch(`${API_BASE_URL}/user/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('User deleted successfully:', result);
                this.showNotification('Hapus', `User "${username}" berhasil dihapus`, 'success');
                return result;
            } catch (error) {
                console.error('Failed to delete user:', error);
                this.showNotification('Hapus', 'Gagal menghapus user', 'error');
                return null;
            }
        },

        /**
         * Validate user data for CRUD operations
         * @param {Object} userData - User data to validate
         * @param {string} operation - Operation type ('register' or 'update')
         * @returns {Object} Validation result with isValid and errors
         */
        validateUserData(userData, operation = 'register') {
            const errors = [];

            if (!userData.username || userData.username.trim() === '') {
                errors.push('Username wajib diisi');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * Show notification message
         * @param {string} type - Type of operation
         * @param {string} message - Message to display
         * @param {string} status - 'success' or 'error'
         */
        showNotification(type, message, status = 'success') {
            // Create or update notification element
            let notification = document.getElementById('user-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'user-notification';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${status === 'success' ? '#28a745' : '#dc3545'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    max-width: 300px;
                    font-size: 14px;
                    line-height: 1.4;
                `;
                document.body.appendChild(notification);
            }

            notification.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <i class="ti-${status === 'success' ? 'check' : 'close'}" style="margin-right: 10px; font-size: 16px;"></i>
                    <div>
                        <strong>${type} ${status === 'success' ? 'Berhasil' : 'Gagal'}</strong><br>
                        <small>${message}</small>
                    </div>
                </div>
            `;

            // Auto-hide
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, status === 'success' ? 5000 : 7000);
        },

        /**
         * Initialize admin page
         */
        initialize() {
            // Check if already authenticated
            if (!this.hasAdminAccess()) {
                this.promptAdminPassword().then((authenticated) => {
                    if (!authenticated) {
                        // Redirect back to main page if authentication failed
                        window.location.href = 'index.html';
                    } else {
                        this.loadUserManagement();
                    }
                });
            } else {
                this.loadUserManagement();
            }
        },

        /**
         * Load user management interface
         */
        loadUserManagement() {
            this.renderUserManagementUI();
            this.attachEventListeners();
            this.loadUsers();
        },

        /**
         * Render user management UI
         */
        renderUserManagementUI() {
            const container = document.getElementById('admin-container');
            if (!container) return;

            container.innerHTML = `
                <div class="admin-header" style="text-align: center; margin-bottom: 40px;">
                    <h1 style="color: #d4a574; margin-bottom: 10px;">User Management</h1>
                    <div class="admin-actions" style="display: flex; justify-content: center; gap: 15px; align-items: center;">
                        <button id="add-user-btn" class="btn btn-primary" style="padding: 10px 20px; background: #d4a574; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="ti-plus"></i> Tambah User
                        </button>
                        <button id="refresh-users-btn" class="btn btn-secondary" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="ti-reload"></i> Refresh
                        </button>
                        <button id="logout-btn" class="btn btn-danger" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="ti-power-off"></i> Logout
                        </button>
                    </div>
                </div>

                <div class="user-list-container" style="margin-bottom: 30px;">
                    <div class="loading-spinner" id="loading" style="text-align: center; padding: 40px; display: none;">
                        <i class="ti-reload" style="font-size: 24px; color: #d4a574; animation: spin 1s linear infinite;"></i>
                        <p style="margin-top: 10px; color: #666;">Memuat data...</p>
                    </div>
                    <div id="user-list"></div>
                </div>

                <!-- User Form Modal -->
                <div id="user-form-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000;">
                    <div class="modal-content" style="background: white; margin: 50px auto; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;">
                        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                            <h3 id="form-title">Tambah User Baru</h3>
                            <button id="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
                        </div>
                        <form id="user-form">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="username" style="display: block; margin-bottom: 5px; color: #333; font-weight: 600;">Username</label>
                                <input type="text" id="username" name="username" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                            </div>
                            <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                                <button type="button" id="cancel-form" class="btn btn-secondary" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    Batal
                                </button>
                                <button type="submit" id="submit-form" class="btn btn-primary" style="padding: 10px 20px; background: #d4a574; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
        },

        /**
         * Attach event listeners to UI elements
         */
        attachEventListeners() {
            // Add user button
            document.getElementById('add-user-btn')?.addEventListener('click', () => {
                this.showUserForm('register');
            });

            // Refresh button
            document.getElementById('refresh-users-btn')?.addEventListener('click', () => {
                this.loadUsers();
            });

            // Logout button
            document.getElementById('logout-btn')?.addEventListener('click', () => {
                this.logoutAdmin();
            });

            // Close modal
            document.getElementById('close-modal')?.addEventListener('click', () => {
                this.hideUserForm();
            });

            // Cancel form
            document.getElementById('cancel-form')?.addEventListener('click', () => {
                this.hideUserForm();
            });

            // Submit form
            document.getElementById('user-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });

            // Close modal when clicking outside
            document.getElementById('user-form-modal')?.addEventListener('click', (e) => {
                if (e.target.id === 'user-form-modal') {
                    this.hideUserForm();
                }
            });
        },

        /**
         * Show user form modal
         * @param {string} operation - 'register' or 'update'
         * @param {Object} userData - User data for update operation
         */
        showUserForm(operation, userData = null) {
            const modal = document.getElementById('user-form-modal');
            const formTitle = document.getElementById('form-title');
            const form = document.getElementById('user-form');

            if (!modal || !formTitle || !form) return;

            // Set form title
            formTitle.textContent = operation === 'register' ? 'Tambah User Baru' : 'Update User';

            // Populate form for update operation
            if (operation === 'update' && userData) {
                document.getElementById('username').value = userData.username || '';
                // document.getElementById('nama_user').value = userData.nama_user || '';
                // document.getElementById('username').setAttribute('readonly', 'readonly');
                document.getElementById('submit-form').textContent = 'Update';
            } else {
                form.reset();
                document.getElementById('username').removeAttribute('readonly');
                document.getElementById('submit-form').textContent = 'Simpan';
            }

            // Store operation type
            form.dataset.operation = operation;
            if (userData) {
                form.dataset.username = userData.username; // Store original username for update
            }

            modal.style.display = 'block';
        },

        /**
         * Hide user form modal
         */
        hideUserForm() {
            const modal = document.getElementById('user-form-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        },

        /**
         * Handle form submission
         */
        async handleFormSubmit() {
            const form = document.getElementById('user-form');
            const operation = form.dataset.operation;
            const originalUsername = form.dataset.username;

            const formData = {
                username: document.getElementById('username').value.trim(),
                // nama_user: document.getElementById('nama_user').value.trim()
            };

            let result;
            if (operation === 'register') {
                result = await this.registerUser(formData);
            } else {
                // For update, use the original username
                result = await this.updateUser({
                    ...formData,
                    // username: originalUsername
                });
            }

            if (result && !result.error) {
                this.hideUserForm();
                this.loadUsers(); // Refresh user list
            }
        },

        /**
         * Load and display users
         */
        async loadUsers() {
            this.showLoading(true);

            try {
                const result = await this.fetchUserList();

                console.log('===> admin-crud.js:649 ~ result.data', result.data);
                if (result && result.data) {
                    this.renderUserList(Array.isArray(result.data) ? result.data : []);
                } else {
                    this.renderUserList([]);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                this.renderUserList([]);
            } finally {
                this.showLoading(false);
            }
        },

        /**
         * Show/hide loading spinner
         * @param {boolean} show - Whether to show the loading spinner
         */
        showLoading(show) {
            const loading = document.getElementById('loading');
            const userList = document.getElementById('user-list');
            console.log('===> admin-crud.js:668 ~ loading', loading);
            console.log('===> admin-crud.js:669 ~ userList', userList);

            if (show) {
                loading.style.display = 'block';
                userList.style.display = 'none';
            } else {
                loading.style.display = 'none';
                userList.style.display = 'block';
            }
        },

        /**
         * Render user list
         * @param {Array} users - Array of user objects
         */
        renderUserList(users) {
            const userListContainer = document.getElementById('user-list');
            if (!userListContainer) return;

            console.log('===> admin-crud.js:688 ~ users', users);
            if (!users || users.length === 0) {
                userListContainer.innerHTML = `
                    <div class="no-users" style="text-align: center; padding: 60px 20px; color: #666;">
                        <i class="ti-user" style="font-size: 48px; color: #d4a574; margin-bottom: 15px;"></i>
                        <h3 style="margin-bottom: 10px;">Belum ada user</h3>
                        <p>Tambahkan user pertama untuk memulai manajemen user</p>
                    </div>
                `;
                return;
            }

            // get current domain 
            const currentDomain = window.location.origin;

            const usersHTML = users.map((user, index) => `
                <div class="user-card" style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #d4a574;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h4 style="margin: 0; color: #333; font-size: 16px;">ID: ${user.id}</h4>
                            <p style="margin: 0; color: #666; font-size: 14px;">@${user.username}</p>
                            <small style="color: #999;">Role: ${user.role || 'user'}</small>
                            <a href="${currentDomain}?id=${user.id}" target="_blank" style="display: block; margin-top: 5px; font-size: 12px; color: #007bff; text-decoration: none;">
                                ${currentDomain}?id=${user.id}
                            </a>
                        </div>
                        <div class="user-actions" style="display: flex; gap: 10px;">
                            <button onclick="UserCRUD.editUser('${user.username}')" class="btn btn-sm" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                <i class="ti-pencil"></i> Edit
                            </button>
                            <button onclick="UserCRUD.confirmDelete('${user.username}')" class="btn btn-sm" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                <i class="ti-trash"></i> Hapus
                            </button>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 10px;">
                        Created: ${user.created_at ? new Date(user.created_at).toLocaleString('id-ID') : 'N/A'}
                    </div>
                </div>
            `).join('');

            userListContainer.innerHTML = usersHTML;
        },

        /**
         * Edit user
         * @param {string} username - Username to edit
         */
        async editUser(username) {
            try {
                // First fetch user details
                const users = await this.fetchUserList();
                const user = users?.data?.find(u => u.username === username);

                if (user) {
                    this.showUserForm('update', user);
                } else {
                    this.showNotification('Edit', 'User tidak ditemukan', 'error');
                }
            } catch (error) {
                console.error('Error fetching user for edit:', error);
                this.showNotification('Edit', 'Gagal memuat data user', 'error');
            }
        },

        /**
         * Confirm and delete user
         * @param {string} username - Username to delete
         */
        async confirmDelete(username) {
            try {
                await this.deleteUser(username);
                this.loadUsers(); // Refresh user list
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    // Expose functions globally
    window.UserCRUD = UserCRUD;
    window.adminAPI = {
        fetchUsers: UserCRUD.fetchUserList.bind(UserCRUD),
        registerUser: UserCRUD.registerUser.bind(UserCRUD),
        updateUser: UserCRUD.updateUser.bind(UserCRUD),
        deleteUser: UserCRUD.deleteUser.bind(UserCRUD)
    };

    // Initialize when page loads
    UserCRUD.initialize();
});