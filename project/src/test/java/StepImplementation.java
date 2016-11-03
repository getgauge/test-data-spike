import com.thoughtworks.gauge.Step;
import com.thoughtworks.gauge.Table;

import static org.junit.Assert.assertEquals;

public class StepImplementation {

    @Step("Search for all popular albums <table>")
    public void searchPopularAlbums(Table table) {
        System.out.println(table);
    }

    @Step("Select all the albums")
    public void selectAllAlbums() {
        System.out.println("Selecting all albums");
    }

    @Step("Add all the selected albums to cart")
    public void addSelectedToCart() {
        System.out.println("Adding selected albums to cart");
    }
    
    @Step("Checkout")
    public void checkout() {
        System.out.println("Checked out successfully!");
    }
}
