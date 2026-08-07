import numpy as np
from ai.embeddings.similarity import cosine_scores,top_k
def test_cosine_similarity_ranking():
    vectors=np.array([[1,0],[0,1],[.8,.2]],dtype=np.float32);ranked=top_k(np.array([1,0]),vectors,3);assert [x[0] for x in ranked]==[0,2,1];assert np.isclose(cosine_scores(np.array([1,0]),vectors)[0],1)
