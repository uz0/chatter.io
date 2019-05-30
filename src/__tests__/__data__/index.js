const currentUser = {
  auth_token: 'Qli089GxuOrWGAAVYzcVJH1px_lRHO6Wf0Ke_icqf8kpndF0Fz_b02li8',

  avatar: {
    full: 'https://chat.mainnetwork.io/rails/active_storage/b…9eb29647350acdf569189259ae78b83/inline_image.jpeg',
    small: 'https://chat.mainnetwork.io/rails/active_storage/r…e8e3e554111dab5bd87656de36a7063/inline_image.jpeg',
  },

  confirmed_at: '2018-10-16T12:06:32Z',
  email: 'efim1382@gmail.com',
  id: 55,
  is_confirmed: true,
  nick: 'efim1382',
  searchable_nick: true,
};

const details = {
  created_at: '2018-10-17T14:15:05Z',
  draft: '',
  group_id: 5,
  id: 69,
  last_mentioned_in_message_id: null,
  last_read_message_id: 5705,
  mute_until: null,
  role: 'rw',
  tags: null,
  user_id: 55,
  user: currentUser,

  group: {
    created_at: '2018-10-17T14:15:05Z',
    icon: null,
    id: 5,
    invite_code: null,
    is_deleted: false,
    name: null,
    type: 'private_chat',
    updated_at: '2018-10-17T14:15:05Z',

    participants: [
      {
        created_at: "2018-10-17T14:15:05Z",
        draft: "",
        group_id: 5,
        id: 69,
        last_mentioned_in_message_id: null,
        last_read_message_id: 5705,
        mute_until: null,
        role: "rw",
        tags: null,
        user: currentUser,
        user_id: 55,
      },

      {
        created_at: "2018-10-17T14:15:05Z",
        draft: "",
        group_id: 5,
        id: 70,
        last_mentioned_in_message_id: null,
        last_read_message_id: 2482,
        mute_until: null,
        role: "rw",

        user: {
          avatar: {
            full: 'https://chat.mainnetwork.io/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBIdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--33756fcf602882ff40d7f4dc9fac66adbc1345c8/inline_image.png',
            small: 'https://chat.mainnetwork.io/rails/active_storage/representations/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBIdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--33756fcf602882ff40d7f4dc9fac66adbc1345c8/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCam9MY21WemFYcGxTU0lOTWpBd2VESXdNRDRHT2daRlZBPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--5bd2204cbe8e3e554111dab5bd87656de36a7063/inline_image.png',
          },

          id: 59,
          is_confirmed: false,
          nick: 'ivan ivanov',
        },

        user_id: 55,
      },
    ],
  },
};

const mockFetch = () => new Promise(resolve => setTimeout(() => resolve(), 100));

const UniversaChatApi = () => ({
  getMessages: mockFetch,
  getSubscriptions: mockFetch,
  updateGroup: mockFetch,
  kick: mockFetch,
  addContact: mockFetch,
  getPrivateSubscription: mockFetch,
  updateSubscription: mockFetch,
  setAccess: mockFetch,
  logout: mockFetch,
  login: mockFetch,
  register: mockFetch,
});

export default {
  currentUser,
  UniversaChatApi,
  details,
};
