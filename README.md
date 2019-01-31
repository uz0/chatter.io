# Chatter.io

```

<ChatContainer /> -> <div />
    componentDidMount
        api.localInterface.onNotificationReceived -> dispatch!
        handleDocumentKeyDown! > redirect

    <NotificationContainer /> FRAGMENT
        Then store.notices[] has something
            if focused
                render <Notice /> from store.notices[]
            
            if !focused
                Web Notification

            then timeout OR closed, remove from store.notices[]
    
        ACTION: addNotice, push store.notices[] (with: image, text)
        ACTION: removeNotice

    <ModalContainer /> -> FRAGMENT!
        Then store.modal_ids has something then render <ModalName />

        switch
            case 'newChat': <NewChatModal />
            case 'editUser': <EditUserModal />
            ...

        render store.modal_ids.map -> ids by switch <ModalName />
    
        ACTION: showModal, push store.modal_ids[]
        ACTION: closeModal, remove from store.modal_ids[]

    <SidebarContainer /> -> <div />
        filters! INSIDE RENDER! FOR ONDEMAND!
            var subscriptions_filtered_ids from store.subscriptions_ids[]

            NEED RESEARCH! maybe shouldComponentUpdate
        
        render var subscriptions_filtered_ids[] -> <SubscriptionItem />

        <Logo />
        <Profile />
            dropdown with links
        <NewChatBtn />
            ACTION: openModal 'newChat'

        ACTION: filter_subscruption!

    <MessagesContainer />
        componentDidMount
            getting subscruption details from store and url
                store.subscription[id] !!!!
                store.messages
            api.messageLoading
        
        render
            messages -> messagesGrouped [{type: 'dateDelimiter', date}, {type: 'unreadDelimiter'}, {type: 'messages', messages_ids}]

            <Header title onClick ... />
                onClick -> ACTION: openModal 'subscriptionDetails'

            state.messagesGrouped.map -> switch type
                case <UnreadDelimiter />
                case <DateDelimiter />
                case messages_ids.map -> <MessageItem messageId hasStatus(галочка)={...} className={скруглены}  hasAvatar={} />
                    Action: setUpdatingMessage store.messagesContainer.editMessageId = id
                    Action: forwardMessage 
                        store.messagesContainer.forwardMessageId = id > 
                        openModal 'forwardMessage' > 
                        redirect to chat > 
                        delete store.messagesContainer.forwardMessageId
                    Action: replyMessage
                        store.messagesContainer.replyMessageId = id > 

            <MessageInput />
                Action: sendMesage
                Action: updateMessage
                Action: removeUpdatingMessage
                Action: removeReplyMessage
    
    Modals
        <NewChatModal />
        <DetailsSubscription />
        <ForwardModal />
        <EditUserModal />


```
