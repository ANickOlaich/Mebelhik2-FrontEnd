import { defineStore } from 'pinia'

let id = 1

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    list: []
  }),

  actions: {
    push({ type = 'info', message, timeout = 5000 }) {
      const item = {
        id: id++,
        type,
        message
      }

      this.list.push(item)

      if (timeout) {
        setTimeout(() => {
          this.remove(item.id)
        }, timeout)
      }
    },

    remove(id) {
      this.list = this.list.filter(n => n.id !== id)
    }
  }
})