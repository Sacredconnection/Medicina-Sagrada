export function ProductReviewForm({ reviewUrl }: { reviewUrl: string }) {
  return <div className="review-compose">
    <div className="review-form">
      <h3>Compartilhe sua experiência</h3>
      <p>Sua avaliação ajuda outras pessoas a conhecer o produto. Você continuará na página deste produto na loja, onde poderá entrar na sua conta e avaliar sua compra.</p>
      <a className="commerce-button" href={reviewUrl}>Acessar a loja para avaliar</a>
    </div>
  </div>;
}
