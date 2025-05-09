import { apiRequest } from './queryClient';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Generic API wrapper for making type-safe API calls
 */
export async function api<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiRequest(method, url, data);
    const responseData = await response.json();
    return {
      data: responseData,
      status: response.status
    };
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    };
  }
}

/**
 * API functions for authentication
 */
export const authApi = {
  login: async (username: string, password: string) => {
    return api('POST', '/api/auth/login', { username, password });
  },
  
  register: async (username: string, email: string, password: string, role: string) => {
    return api('POST', '/api/auth/register', { username, email, password, role });
  },
  
  logout: async () => {
    return api('POST', '/api/auth/logout', {});
  },
  
  getCurrentUser: async () => {
    return api('GET', '/api/auth/me');
  }
};

/**
 * API functions for jobs
 */
export const jobsApi = {
  getJobs: async () => {
    return api('GET', '/api/jobs');
  },
  
  getMyJobs: async () => {
    return api('GET', '/api/jobs/mine');
  },
  
  getActiveJobs: async () => {
    return api('GET', '/api/jobs/active');
  },
  
  getJob: async (id: number) => {
    return api('GET', `/api/jobs/${id}`);
  },
  
  createJob: async (jobData: any) => {
    return api('POST', '/api/jobs', jobData);
  },
  
  acceptJob: async (id: number) => {
    return api('POST', `/api/jobs/${id}/accept`, {});
  },
  
  completeJob: async (id: number) => {
    return api('POST', `/api/jobs/${id}/complete`, {});
  }
};

/**
 * API functions for messages
 */
export const messagesApi = {
  getMessages: async (jobId: number) => {
    return api('GET', `/api/messages/${jobId}`);
  },
  
  getConversations: async () => {
    return api('GET', '/api/messages/conversations');
  },
  
  sendMessage: async (messageData: { jobId: number; receiverId: number; content: string }) => {
    return api('POST', '/api/messages', messageData);
  }
};

/**
 * API functions for verifications
 */
export const verificationsApi = {
  submitVerification: async (formData: FormData) => {
    const response = await fetch('/api/verifications', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text || response.statusText}`);
    }
    
    return await response.json();
  },
  
  getVerifications: async () => {
    return api('GET', '/api/verifications');
  },
  
  reviewVerification: async (id: number, approved: boolean) => {
    return api('POST', `/api/verifications/${id}/review`, { approved });
  }
};

/**
 * API functions for user profiles
 */
export const profileApi = {
  updateProfile: async (userData: any) => {
    return api('PUT', '/api/users/profile', userData);
  },
  
  getProfile: async (userId?: number) => {
    return api('GET', userId ? `/api/users/${userId}` : '/api/users/profile');
  },
  
  connectStripe: async () => {
    return api('POST', '/api/users/connect-stripe', {});
  }
};
