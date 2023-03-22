import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  FirestoreErrorCode,
  QueryDocumentSnapshot,
  FirestoreError,
  getDoc,
  getDocs,
  startAfter,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from '@firebase/storage'
import { useState, useEffect, useContext } from 'react'
import { comment } from './useComment'
import { db, storage } from '../../firebaseApp'
import { useAuth } from './useAuth'
import { NotificationContext } from '../../context/NotificationContext'
import { Article, ArticlePreview } from 'types/Article'
import { articlePreviewTranslator } from 'utils/firebase/article'
import { UserData } from 'types/UserData'
import { getUser } from 'utils/firebase/user'

export const useArticleRecents = (n: number) => {
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [loadingNext, setLoadingNext] = useState(false)
  const [articles, setArticles] = useState<ArticlePreview[]>([])

  const q = query(
    collection(db, 'article'),
    where('published', '==', true),
    orderBy('publish_time', 'desc'),
  )

  const [lastArticle, setLastArticle] =
    useState<QueryDocumentSnapshot<DocumentData>>()
  const [endOfCollection, setEndOfCollection] = useState(false)

  useEffect(() => {
    getDocs(query(q, limit(n)))
      .then((docs: QuerySnapshot<DocumentData>) => {
        setLoading(false)
        setArticles(articlePreviewTranslator(docs))
        setLastArticle(docs.docs[docs.docs.length - 1])
        setEndOfCollection(docs.docs.length < n)
      })
      .catch((err: FirestoreError) => {
        setError(err.code)
      })
  }, [])

  const getNext = (n: number) => {
    setLoadingNext(true)
    getDocs(query(q, startAfter(lastArticle), limit(n)))
      .then((docs: QuerySnapshot<DocumentData>) => {
        setLoadingNext(false)
        setArticles(articles.concat(articlePreviewTranslator(docs)))
        setLastArticle(docs.docs[docs.docs.length - 1])
        setEndOfCollection(docs.docs.length < n)
      })
      .catch((err: FirestoreError) => {
        setError(err.code)
      })
  }

  return { getNext, error, loading, loadingNext, articles, endOfCollection }
}

export const useArticleRead = (articleID: string) => {
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [article, setArticle] = useState<Article>()

  useEffect(() => {
    getDoc(doc(db, 'article', articleID))
      .then((doc) => {
        const data = doc.data()
        if (data === undefined) {
          setError('not-found')
        } else {
          setLoading(false)
          setArticle(data as Article)
        }
      })
      .catch((err: FirestoreError) => {
        setError(err.code)
      })
  }, [articleID])

  return { error, loading, article }
}

export const useArticleComments = (articleID: string, n: number) => {
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<comment[]>([])
  const [loadingNext, setLoadingNext] = useState(false)

  const q = query(
    collection(db, `article/${articleID}/comments`),
    orderBy('post_time', 'desc'),
  )

  const [lastComment, setLastComment] =
    useState<QueryDocumentSnapshot<DocumentData>>()
  const [endOfCollection, setEndOfCollection] = useState(false)

  useEffect(() => {
    getDocs(query(q, limit(n)))
      .then((docs: QuerySnapshot<DocumentData>) => {
        const commentsData: comment[] = []
        docs.forEach((doc) => {
          commentsData.push({
            commenter_uid: doc.data().commenter_uid,
            commenter_image: doc.data().commenter_image,
            commenter_username: doc.data().commenter_username,
            content: doc.data().content,
            post_time: doc.data().post_time,
            commentID: doc.id,
          })
        })
        setLoading(false)
        setComments(commentsData)
        setLastComment(docs.docs[docs.docs.length - 1])
        setEndOfCollection(docs.docs.length < n)
      })
      .catch((err: FirestoreError) => {
        setError(err.code)
      })
  }, [articleID])

  const getNext = (n: number) => {
    setLoadingNext(true)
    getDocs(query(q, startAfter(lastComment), limit(n)))
      .then((docs: QuerySnapshot<DocumentData>) => {
        const commentsData: comment[] = []
        docs.forEach((doc) => {
          commentsData.push({
            commenter_uid: doc.data().commenter_uid,
            commenter_image: doc.data().commenter_image,
            commenter_username: doc.data().commenter_username,
            content: doc.data().content,
            post_time: doc.data().post_time,
            commentID: doc.id,
          })
        })
        setLoadingNext(false)
        setComments(comments.concat(commentsData))
        setLastComment(docs.docs[docs.docs.length - 1])
        setEndOfCollection(docs.docs.length < n)
      })
      .catch((err: FirestoreError) => {
        setError(err.code)
      })
  }

  return { getNext, error, loading, loadingNext, comments, endOfCollection }
}

export const useUploadHeader = () => {
  const { user: currentUser } = useAuth()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [imageURL, setImageURL] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const uuid = require('uuid')

  const uploadHeader = async (file: File) => {
    if (currentUser == null) {
      setError('unauthenticated')
      return
    }
    setLoading(true)
    const path = `${currentUser.uid}/${file.name}${uuid.v4()}`
    // const storageRef = ref(storage, `${currentUser.uid}/${file.name}${uuid.v4()}`)
    // try {
    //     await uploadBytes(storageRef, file)
    //     const url = await getDownloadURL(storageRef)
    //     setImageURL(url)
    //     setLoading(false)
    // } catch (err) {
    //     if (err instanceof FirestoreError) {
    //         setError(err.code)
    //     } else {
    //         setError("unknown-error")
    //     }
    //     setLoading(false)
    const storageRef = ref(storage, path)
    uploadBytes(storageRef, file)
      .then(() => {
        getDownloadURL(storageRef).then((res) => {
          setLoading(false)
          setImageURL(res)
        })
      })
      .catch((err) => {
        setLoading(false)
        setError(err.code)
      })
  }

  return { uploadHeader, error, loading, imageURL }
}

export const useArticleCreate = () => {
  const { user: currentUser } = useAuth()
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(false)
  const [articleId, setArticleId] = useState<string>()

  const createArticle = (
    title: string,
    content: string,
    header_image: string,
    published: boolean,
  ) => {
    getUser(currentUser?.uid ?? null)
      .then((user: UserData) =>
        addDoc(collection(db, 'article'), {
          author_uid: user.uid,
          author_image: user.profile_image,
          author_username: user.username,
          content: content,
          edit_time: serverTimestamp(),
          header_image: header_image,
          published: published,
          publish_time: published ? serverTimestamp() : null,
          title: title,
        }).then(
          (doc) => {
            setLoading(true)
            setArticleId(doc.id)
          },
          (err) => {
            setLoading(false)
            setError(err.code)
          },
        ),
      )
      .catch((err) => {
        setError('unauthenticated')
      })
  }

  return { createArticle, error, loading, articleId, setLoading }
}

export const useArticleEdit = () => {
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(false)

  const editArticle = (
    articleID: string,
    title: string,
    content: string,
    header_image: string,
    published: boolean,
  ) => {
    setLoading(true)
    updateDoc(doc(db, 'article', articleID), {
      content: content,
      edit_time: serverTimestamp(),
      header_image: header_image,
      published: published,
      publish_time: published ? serverTimestamp() : null,
      title: title,
    }).then(
      () => {
        setLoading(false)
      },
      (err) => {
        setError(err.code)
      },
    )
    setLoading(false)
  }

  return { editArticle, error, loading, setLoading }
}

export const useArticleDelete = (articleID: string) => {
  const { dispatch } = useContext(NotificationContext)
  const [error, setError] = useState<FirestoreErrorCode>()
  const [loading, setLoading] = useState(true)

  const deleteArticle = async () =>
    deleteDoc(doc(db, 'article', articleID)).then(
      () => {
        dispatch({
          notificationActionType: 'success',
          message: `Successfuly deleted article`,
        })
        setLoading(false)
      },
      (err) => {
        dispatch({
          notificationActionType: 'error',
          message: `Error deleting article. Error code: ${err.code}`,
        })
        setError(err.code)
      },
    )

  return { deleteArticle, error, loading }
}
