import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  useEffect(() => { document.title = "Giới thiệu UniHome | Website tìm phòng trọ"; }, []);
  return <main id="about-top" className="w-full flex-1 bg-white text-slate-900">
    <article className="unihome-about mx-auto max-w-[1120px] px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Đường dẫn trang" className="mb-8 text-sm text-slate-500"><Link to="/" className="text-blue-700 hover:underline">Trang chủ</Link><span className="mx-2" aria-hidden="true">/</span><span aria-current="page">Giới thiệu</span></nav>
      <h1 className="text-[30px] leading-tight font-bold sm:text-4xl">Giới thiệu UniHome</h1>
      <p className="mt-5">Tìm một căn phòng phù hợp là bước khởi đầu để ổn định cuộc sống, học tập và làm việc tại một thành phố. UniHome được xây dựng để giúp sinh viên và người đi làm tìm hiểu các phòng trọ thuộc hệ thống cơ sở UniHome, xem thông tin tại một nơi và chủ động lựa chọn không gian ở phù hợp với nhu cầu.</p>
      <p>Thay vì tìm kiếm qua nhiều bài đăng rời rạc, bạn có thể khám phá phòng theo khu vực, mức giá, diện tích và vị trí trên bản đồ. Các thông tin về phòng, tiện ích và chi phí giúp bạn có thêm cơ sở để cân nhắc trước khi gửi yêu cầu liên hệ hoặc hẹn xem phòng.</p>

      <section aria-labelledby="about-overview"><h2 id="about-overview">UniHome là gì?</h2>
        <p>UniHome là website hỗ trợ tìm kiếm phòng trọ, tập trung vào các phòng và tòa nhà được quản lý trong hệ thống UniHome. Mỗi phòng được liên kết với một cơ sở để người tìm phòng có thể xem địa chỉ, vị trí, đặc điểm và tình trạng cho thuê trong cùng một trải nghiệm.</p>
        <p>Website phục vụ những người đang tìm chỗ ở, muốn tham khảo các lựa chọn trước khi đi xem thực tế, hoặc cần lưu lại những căn phòng quan tâm để tiếp tục tìm hiểu. Với quản trị viên, UniHome cung cấp khu vực quản lý dữ liệu phòng, cơ sở và các yêu cầu liên hệ của người dùng.</p>
      </section>

      <section aria-labelledby="about-purpose"><h2 id="about-purpose">Mục tiêu của chúng tôi</h2>
        <p>UniHome hướng đến việc làm cho quá trình tìm phòng trở nên dễ tiếp cận và có tổ chức hơn. Người dùng có thể bắt đầu từ nhu cầu thực tế của mình: ngân sách hàng tháng, diện tích mong muốn, khu vực sinh sống và khoảng cách tới trường học hoặc nơi làm việc.</p>
        <p>Thông tin được trình bày theo từng phòng và từng cơ sở để bạn thuận tiện tra cứu, so sánh và chuẩn bị câu hỏi khi liên hệ. Mục tiêu của website là hỗ trợ quá trình tìm hiểu và kết nối; việc xem phòng, xác nhận chi phí và thống nhất điều kiện thuê vẫn cần được thực hiện trực tiếp với cơ sở.</p>
      </section>

      <section aria-labelledby="about-features"><h2 id="about-features">Bạn có thể làm gì trên UniHome?</h2>
        <h3>Tìm phòng theo nhu cầu</h3>
        <p>Tại trang chủ, bạn có thể chọn khu vực, khoảng giá thuê và diện tích để tìm các phòng phù hợp. Trợ lý tìm phòng hỗ trợ nhận diện một số tiêu chí từ mô tả bằng tiếng Việt, chẳng hạn như khu vực, giá và diện tích. Bạn nên kiểm tra lại các bộ lọc được áp dụng và thông tin chi tiết của từng kết quả.</p>
        <h3>Khám phá các cơ sở trên bản đồ</h3>
        <p><Link to="/?page=rooms">Bản đồ phòng</Link> hiển thị vị trí những tòa nhà UniHome có tọa độ đã được cập nhật. Chọn một cơ sở trong danh sách hoặc trên bản đồ để xem vị trí và các phòng còn trống thuộc cơ sở đó.</p>
        <p>Bạn cũng có thể chọn một điểm trường học hoặc nơi làm việc, nhập bán kính và tìm phòng xung quanh. Khoảng cách được tính theo đường chim bay, giúp bạn tham khảo vị trí tương đối; đây không phải quãng đường hoặc thời gian di chuyển thực tế.</p>
        <h3>Xem thông tin phòng và chi phí</h3>
        <p>Trang chi tiết cung cấp các thông tin đã được cập nhật cho phòng như giá thuê, diện tích, hình ảnh, mô tả, tiện ích, tình trạng cho thuê và vị trí cơ sở. Những khoản chi phí liên quan được hiển thị theo dữ liệu của phòng hoặc cơ sở để bạn thuận tiện tham khảo trước khi trao đổi.</p>
        <h3>Lưu những phòng bạn quan tâm</h3>
        <p>Nhấn biểu tượng trái tim trên thẻ phòng để thêm vào <Link to="/?page=favorites">Phòng yêu thích</Link>. Danh sách được lưu trong trình duyệt trên thiết bị đang sử dụng, giúp bạn quay lại xem các lựa chọn đã lưu. Danh sách này có thể mất khi bạn xóa dữ liệu trình duyệt và không tự đồng bộ sang thiết bị khác.</p>
        <h3>Gửi yêu cầu liên hệ và hẹn xem phòng</h3>
        <p>Sau khi đăng nhập, bạn có thể gửi thông tin liên hệ, thời gian dự kiến xem phòng và ghi chú tại trang chi tiết. Các yêu cầu đã gửi và phản hồi của quản lý được theo dõi trong mục yêu cầu liên hệ của tài khoản. Gửi yêu cầu không đồng nghĩa với việc lịch hẹn đã được xác nhận hoặc phòng đã được giữ chỗ.</p>
      </section>

      <section aria-labelledby="about-steps"><h2 id="about-steps">Bắt đầu tìm phòng như thế nào?</h2>
        <ol>
          <li><strong>Xác định nhu cầu:</strong> cân nhắc khu vực, ngân sách và diện tích phù hợp với sinh hoạt của bạn.</li>
          <li><strong>Khám phá các lựa chọn:</strong> sử dụng bộ lọc trên trang chủ hoặc xem các cơ sở UniHome trên bản đồ.</li>
          <li><strong>Tìm hiểu từng phòng:</strong> xem hình ảnh, mô tả, chi phí, tiện ích và lưu những phòng bạn quan tâm.</li>
          <li><strong>Liên hệ và xem thực tế:</strong> đăng nhập, gửi yêu cầu và theo dõi phản hồi từ quản lý trước khi tới xem.</li>
          <li><strong>Xác nhận trước khi thuê:</strong> trao đổi trực tiếp về tình trạng phòng, tiền cọc, chi phí và các điều kiện thuê.</li>
        </ol>
      </section>

      <section aria-labelledby="about-management"><h2 id="about-management">Quản lý thông tin trong hệ thống</h2>
        <p>Khu vực quản trị dành cho tài khoản được phân quyền giúp quản lý thông tin phòng, trạng thái cho thuê, người dùng và các yêu cầu liên hệ. Tọa độ tòa nhà có thể được nhập và cập nhật thủ công để hiển thị vị trí cơ sở trên bản đồ.</p>
        <p>Nội dung bạn thấy trên website phụ thuộc vào dữ liệu được cập nhật trong hệ thống. Trường hợp một cơ sở chưa có tọa độ hoặc một phòng chưa có hình ảnh, website sẽ thể hiện thông tin đang có thay vì thay thế bằng thông tin chưa được xác nhận.</p>
      </section>

      <section aria-labelledby="about-notes"><h2 id="about-notes">Những điều cần lưu ý khi tìm phòng</h2>
        <ul>
          <li>Giá thuê và tình trạng phòng cần được xác nhận lại với cơ sở tại thời điểm liên hệ.</li>
          <li>Nên tới xem phòng để kiểm tra không gian, trang thiết bị, điều kiện sinh hoạt và khu vực xung quanh.</li>
          <li>Làm rõ các khoản tiền cọc, điện, nước, dịch vụ và điều kiện hợp đồng trước khi quyết định thuê.</li>
          <li>Việc xem thông tin, lưu phòng yêu thích hoặc gửi yêu cầu liên hệ không tạo ra giao dịch thuê phòng trên website.</li>
        </ul>
      </section>

      <section aria-labelledby="about-explore"><h2 id="about-explore">Tìm không gian ở phù hợp với bạn</h2>
        <p>Dù bạn đang chuẩn bị nhập học, chuyển nơi làm việc hay muốn tìm một chỗ ở mới, UniHome giúp bạn bắt đầu bằng những thông tin có thể tra cứu và các lựa chọn cụ thể. Hãy khám phá các cơ sở, xem những căn phòng đang có và chủ động liên hệ khi tìm được lựa chọn phù hợp.</p>
        <p><Link to="/?page=rooms">Khám phá bản đồ phòng UniHome →</Link><span className="mx-3 text-slate-300" aria-hidden="true">|</span><Link to="/">Tìm phòng tại trang chủ →</Link></p>
      </section>
      <a href="#about-top" className="mt-8 inline-block text-sm text-blue-700 underline underline-offset-2">Quay lại đầu trang</a>
    </article>
  </main>;
}
