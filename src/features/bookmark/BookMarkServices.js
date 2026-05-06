import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiEndpoints } from '../config/environment'

export const BookMarkApi = createApi({
    reducerPath: 'BookMarkApi',
    baseQuery: fetchBaseQuery({
        baseUrl: apiEndpoints.bookmark,
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getAllBookMarks: builder.query({
            query: () => ({
                url: '/bookmarks',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('user')}`,
                },
            }),
            providesTags: ['BookMarks'],
        }),

        addToBookMark: builder.mutation({
            query: (id) => ({
                url: `/add/${id}`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('user')}`,
                },
            }),
            invalidatesTags: ['BookMarks']

        }),

        removeFromBookMark: builder.mutation({
            query: (id) => ({
                url: `/remove/${id}`,
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('user')}`,
                },
            }),
            invalidatesTags: ['BookMarks']
        })
    })
})

export const { useGetAllBookMarksQuery, useAddToBookMarkMutation, useRemoveFromBookMarkMutation } = BookMarkApi